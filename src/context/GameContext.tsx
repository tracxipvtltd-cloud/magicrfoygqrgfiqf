import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { 
  GameMode, 
  MatrixSize, 
  DifficultyLevel,
  SudokuSumPuzzle, 
  PuzzleCell,
  UserProfile, 
  GameScoreRecord, 
  GameResult,
  NonogramLevel
} from '../types';
import { 
  createSudokuSumPuzzle, 
  validateBoardSums,
  getMagicSumForSize,
  getMaxNumberForSize,
  generateCampaignLevels,
  getLevelConfig
} from '../services/magicMatrixEngine';
import { sound } from '../services/soundEffects';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  fetchUserProfile, 
  saveUserProfile, 
  recordMatchScore,
  recordDailyChallengeCompletion
} from '../services/firebase';

interface HistoryEntry {
  row: number;
  col: number;
  prevValue: number | null;
  prevNotes: number[];
}

interface GameContextType {
  // Navigation & Screen
  currentScreen: 'home' | 'difficulty' | 'game' | 'result' | 'leaderboard' | 'daily';
  setCurrentScreen: (screen: 'home' | 'difficulty' | 'game' | 'result' | 'leaderboard' | 'daily') => void;
  activeTab: 'home' | 'daily' | 'play' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'daily' | 'play' | 'stats' | 'settings') => void;

  // Active Puzzle State
  puzzle: SudokuSumPuzzle;
  targetSum: number;
  setTargetSum: (sum: number) => void;
  selectedSize: MatrixSize;
  setSelectedSize: (size: MatrixSize) => void;
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;

  // Grid Interaction: Tapping upper box, then tapping lower number set
  selectedCell: { row: number; col: number } | null;
  selectCell: (row: number, col: number) => void;
  enterNumber: (num: number) => void;
  eraseCell: () => void;
  isPencilMode: boolean;
  togglePencilMode: () => void;
  undoMove: () => void;
  canUndo: boolean;
  useHint: () => void;
  hintsLeft: number;

  // No-repeat duplicate detection & status
  duplicateCells: { row: number; col: number }[];
  rowHasDuplicates: boolean[];
  colHasDuplicates: boolean[];
  conflictWarning: string | null;
  clearConflictWarning: () => void;

  // Live Line Sums & Status
  rowSums: number[];
  colSums: number[];
  diag1Sum: number;
  diag2Sum: number;
  isRowComplete: boolean[];
  isColComplete: boolean[];
  isDiag1Complete: boolean;
  isDiag2Complete: boolean;

  // Game Stats
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  timeElapsed: number;
  isPaused: boolean;
  togglePause: () => void;
  startNewGame: (size?: MatrixSize, target?: number, diff?: DifficultyLevel, mode?: GameMode) => void;
  restartGame: () => void;
  quitGame: () => void;
  lastResult: GameResult | null;

  // Nonogram Level Progression: Start from zero, board sizes assigned by level
  levelsProgress: NonogramLevel[];
  currentLevelNumber: number | null;
  startLevel: (levelNumOrSize: MatrixSize | number, levelNumOpt?: number) => void;
  resetAllProgress: () => void;
  isDailyChallenge: boolean;
  startDailyChallenge: (day?: number) => void;
  completedDailyDates: string[];

  // Auth & Profile
  user: User | null;
  userProfile: UserProfile;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  handleLoginWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
  authLoading: boolean;

  // Settings & Theme
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleTheme: () => void;
  deviceFrame: 'iphone' | 'fullscreen';
  setDeviceFrame: (val: 'iphone' | 'fullscreen') => void;
  autoCheckErrors: boolean;
  setAutoCheckErrors: (val: boolean) => void;
}

// Start from ZERO: level 1, 0 XP, 0 games played, 0 best score
const DEFAULT_PROFILE: UserProfile = {
  userId: 'local_guest',
  displayName: 'Numtrix Hunter',
  level: 1,
  xp: 0,
  gamesPlayed: 0,
  bestScore: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  avgReactionTime: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation: Nonogram structure (home/levels, daily, difficulty/play, game, result, leaderboard)
  const [currentScreen, setCurrentScreen] = useState<'home' | 'difficulty' | 'game' | 'result' | 'leaderboard' | 'daily'>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'daily' | 'play' | 'stats' | 'settings'>('home');

  // Starting at Level 1: 3x3 starter board (values 1..9, target sum 15, beginner)
  const [selectedSize, setSelectedSize] = useState<MatrixSize>(3);
  const [targetSum, setTargetSum] = useState<number>(15);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');

  // Level Progression: Start from zero, board sizes assigned by level
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number | null>(1);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  const [levelsProgress, setLevelsProgress] = useState<NonogramLevel[]>(() => {
    const saved = localStorage.getItem('numtrix_campaign_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If this was an old mock dataset where level 2 or 3 was pre-completed, reset to 0
          const hasOldMockData = parsed.some((l: NonogramLevel) => l.levelNumber > 1 && l.isCompleted && !localStorage.getItem('numtrix_has_played'));
          if (!hasOldMockData) {
            return parsed;
          }
        }
      } catch {
        /* fallback */
      }
    }
    return generateCampaignLevels(48);
  });

  const [completedDailyDates, setCompletedDailyDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('numtrix_daily_completed') || localStorage.getItem('sumoku_daily_completed');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallback */
      }
    }
    const today = new Date();
    // Pre-populate a couple completed past dates for realistic calendar
    const d1 = new Date(today);
    d1.setDate(today.getDate() - 1);
    const d2 = new Date(today);
    d2.setDate(today.getDate() - 2);
    return [d1.toISOString().slice(0, 10), d2.toISOString().slice(0, 10)];
  });

  // Settings & Theme
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('numtrix_theme') || localStorage.getItem('magicmatrix_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'fullscreen'>('iphone');
  const [autoCheckErrors, setAutoCheckErrors] = useState(true);

  // Duplicate error state
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [duplicateCells, setDuplicateCells] = useState<{ row: number; col: number }[]>([]);
  const [rowHasDuplicates, setRowHasDuplicates] = useState<boolean[]>([]);
  const [colHasDuplicates, setColHasDuplicates] = useState<boolean[]>([]);

  const clearConflictWarning = () => setConflictWarning(null);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('numtrix_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('numtrix_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    sound.playClick();
    setIsDarkMode((prev) => !prev);
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sound.soundEnabled = val;
  };
  const setHapticsEnabled = (val: boolean) => {
    setHapticsEnabledState(val);
    sound.hapticsEnabled = val;
  };

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('numtrix_profile') || localStorage.getItem('magicmatrix_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        // Start from zero: if old mock profile values exist, reset to zero
        if (p.gamesPlayed === 142 || p.xp === 3240) {
          return DEFAULT_PROFILE;
        }
        return p;
      } catch { /* ignore */ }
    }
    return DEFAULT_PROFILE;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem('numtrix_profile', JSON.stringify(profile));
          } else {
            const newProfile: UserProfile = {
              ...userProfile,
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Numtrix Master',
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || undefined,
              updatedAt: new Date().toISOString(),
            };
            setUserProfile(newProfile);
            await saveUserProfile(newProfile);
            localStorage.setItem('numtrix_profile', JSON.stringify(newProfile));
          }
        } catch (e) {
          console.warn('Profile sync notice:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      sound.playVictory();
      setIsAuthModalOpen(false);
    } catch (err) {
      sound.playWrong();
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    sound.playClick();
  };

  // Puzzle State: Default Level 1 (3x3 with target sum 15, values 1..9, beginner)
  const [puzzle, setPuzzle] = useState<SudokuSumPuzzle>(() =>
    createSudokuSumPuzzle(3, 15, 'beginner', 'classic')
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  // Live line calculations
  const [rowSums, setRowSums] = useState<number[]>([]);
  const [colSums, setColSums] = useState<number[]>([]);
  const [diag1Sum, setDiag1Sum] = useState(0);
  const [diag2Sum, setDiag2Sum] = useState(0);
  const [isRowComplete, setIsRowComplete] = useState<boolean[]>([]);
  const [isColComplete, setIsColComplete] = useState<boolean[]>([]);
  const [isDiag1Complete, setIsDiag1Complete] = useState(false);
  const [isDiag2Complete, setIsDiag2Complete] = useState(false);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => +(prev + 0.1).toFixed(1));
    }, 100);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Recalculate sums and check duplicate numbers whenever puzzle grid changes
  useEffect(() => {
    const rawGrid = puzzle.grid.map((r) => r.map((c) => c.value));
    const val = validateBoardSums(rawGrid, puzzle.targetSum);
    setRowSums(val.rowSums);
    setColSums(val.colSums);
    setDiag1Sum(val.diag1Sum);
    setDiag2Sum(val.diag2Sum);
    setIsRowComplete(val.isRowComplete);
    setIsColComplete(val.isColComplete);
    setIsDiag1Complete(val.isDiag1Complete);
    setIsDiag2Complete(val.isDiag2Complete);
    setRowHasDuplicates(val.rowHasDuplicates);
    setColHasDuplicates(val.colHasDuplicates);
    setDuplicateCells(val.duplicateCells);

    // Synchronize isDuplicate flag onto cells so UI can render duplicate conflict glow
    const dupKeySet = new Set(val.duplicateCells.map((d) => `${d.row},${d.col}`));
    let hasGridChange = false;
    const nextGrid = puzzle.grid.map((row, r) =>
      row.map((cell, c) => {
        const isDup = dupKeySet.has(`${r},${c}`);
        if (cell.isDuplicate !== isDup) {
          hasGridChange = true;
          return { ...cell, isDuplicate: isDup };
        }
        return cell;
      })
    );

    if (hasGridChange) {
      setPuzzle((prev) => ({ ...prev, grid: nextGrid }));
    }

    // Check for victory condition! (Must have satisfied sums AND NO REPEATED NUMBERS)
    if (val.allLinesSatisfied) {
      handleGameWin();
    }
  }, [puzzle.grid, puzzle.targetSum]);

  // Win Handler
  const handleGameWin = useCallback(() => {
    stopTimer();
    sound.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#22D3EE', '#22C55E', '#F59E0B', '#A855F7'],
    });

    const speedBonus = Math.max(0, Math.round((120 - Math.min(timeElapsed, 110)) * 25));
    const finalScore = score + 2500 + speedBonus;
    const accuracy = correctCount + wrongCount > 0 
      ? Math.round((correctCount / (correctCount + wrongCount)) * 1000) / 10 
      : 100;
    const xpEarned = Math.round(finalScore / 10) + 300;
    const isNewBest = finalScore > userProfile.bestScore;

    // Calculate stars: 3 stars if 0 wrong, 2 stars if <=2 wrong, 1 star otherwise
    const starsAwarded = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

    // Update Nonogram level progression if playing a campaign level
    if (currentLevelNumber) {
      localStorage.setItem('numtrix_has_played', 'true');
      setLevelsProgress((prev) => {
        const updatedList = prev.map((lvl) => {
          if (lvl.levelNumber === currentLevelNumber) {
            return {
              ...lvl,
              isCompleted: true,
              stars: Math.max(lvl.stars, starsAwarded),
              bestTime: lvl.bestTime ? Math.min(lvl.bestTime, timeElapsed) : timeElapsed,
            };
          }
          if (lvl.levelNumber === currentLevelNumber + 1) {
            return { ...lvl, isUnlocked: true };
          }
          return lvl;
        });
        localStorage.setItem('numtrix_campaign_levels', JSON.stringify(updatedList));
        return updatedList;
      });
    }

    // Daily Challenge completion record
    if (isDailyChallenge) {
      const todayStr = new Date().toISOString().slice(0, 10);
      setCompletedDailyDates((prev) => {
        if (!prev.includes(todayStr)) {
          const nextDates = [...prev, todayStr];
          localStorage.setItem('sumoku_daily_completed', JSON.stringify(nextDates));
          return nextDates;
        }
        return prev;
      });
      if (user) {
        recordDailyChallengeCompletion({
          recordId: `daily_${Date.now()}`,
          userId: user.uid,
          displayName: user.displayName || userProfile.displayName,
          challengeDate: todayStr,
          score: finalScore,
          timeSeconds: timeElapsed,
          completedAt: new Date().toISOString(),
        }).catch((e) => console.warn('Daily sync error:', e));
      }
    }

    const result: GameResult = {
      score: finalScore,
      accuracy,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      bestStreak: Math.max(maxStreak, streak),
      timeSeconds: timeElapsed,
      speedBonus,
      xpEarned,
      isNewBest,
      matrixSize: puzzle.size,
      targetSum: puzzle.targetSum,
      mode: puzzle.mode,
      difficulty: puzzle.difficulty,
      solvedGrid: puzzle.grid.map((r) => r.map((c) => c.value || 0)),
    };

    setLastResult(result);

    // Profile updates
    const updatedProfile: UserProfile = {
      ...userProfile,
      gamesPlayed: userProfile.gamesPlayed + 1,
      xp: userProfile.xp + xpEarned,
      level: Math.floor((userProfile.xp + xpEarned) / 250) + 1,
      bestScore: Math.max(userProfile.bestScore, finalScore),
      bestStreak: Math.max(userProfile.bestStreak, maxStreak),
      totalCorrect: userProfile.totalCorrect + correctCount,
      totalWrong: userProfile.totalWrong + wrongCount,
      avgReactionTime: correctCount > 0 
        ? Math.round((timeElapsed / correctCount) * 100) / 100 
        : userProfile.avgReactionTime,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('numtrix_profile', JSON.stringify(updatedProfile));

    if (user) {
      saveUserProfile(updatedProfile).catch((err) => console.warn('Cloud sync error:', err));
      const record: GameScoreRecord = {
        scoreId: `score_${Date.now()}_${user.uid.slice(0, 5)}`,
        userId: user.uid,
        displayName: user.displayName || userProfile.displayName,
        photoURL: user.photoURL || undefined,
        mode: puzzle.mode,
        matrixSize: puzzle.size,
        targetSum: puzzle.targetSum,
        score: finalScore,
        accuracy,
        timeSeconds: timeElapsed,
        maxStreak: Math.max(maxStreak, streak),
        createdAt: new Date().toISOString(),
      };
      recordMatchScore(record).catch((err) => console.warn('Record score error:', err));
    }

    setTimeout(() => {
      setCurrentScreen('result');
    }, 1200);
  }, [
    stopTimer, 
    score, 
    timeElapsed, 
    correctCount, 
    wrongCount, 
    maxStreak, 
    streak, 
    userProfile, 
    puzzle, 
    user,
    currentLevelNumber,
    isDailyChallenge
  ]);

  // Start / Reset Game with N x N unique values & magic sum
  const startNewGame = useCallback(
    (
      sizeToUse?: MatrixSize,
      targetToUse?: number,
      diffToUse?: DifficultyLevel,
      modeToUse?: GameMode
    ) => {
      const sz = sizeToUse || selectedSize;
      const tgt = targetToUse || getMagicSumForSize(sz);
      const diff = diffToUse || difficulty;
      const md = modeToUse || selectedMode;

      setSelectedSize(sz);
      setTargetSum(tgt);
      setDifficulty(diff);
      setSelectedMode(md);
      setConflictWarning(null);

      const newPuzzle = createSudokuSumPuzzle(sz, tgt, diff, md);
      setPuzzle(newPuzzle);

      // Select first empty upper cell
      let firstEmpty: { row: number; col: number } | null = null;
      for (let r = 0; r < sz; r++) {
        for (let c = 0; c < sz; c++) {
          if (!newPuzzle.grid[r][c].isGiven) {
            firstEmpty = { row: r, col: c };
            break;
          }
        }
        if (firstEmpty) break;
      }
      setSelectedCell(firstEmpty);

      const initLives = md === 'practice' ? 999 : 3;
      setLives(initLives);
      setMaxLives(initLives);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setCorrectCount(0);
      setWrongCount(0);
      setHintsLeft(3);
      setHistory([]);
      setIsPaused(false);
      setTimeElapsed(0);

      setCurrentScreen('game');
      startTimer();
      sound.playClick();
    },
    [selectedSize, difficulty, selectedMode, startTimer]
  );

  // Start a specific Nonogram level (board size and difficulty are assigned by level)
  const startLevel = useCallback(
    (levelNumOrSize: MatrixSize | number, levelNumOpt?: number) => {
      const targetLevelNum = typeof levelNumOpt === 'number' ? levelNumOpt : (levelNumOrSize as number);
      setCurrentLevelNumber(targetLevelNum);
      setIsDailyChallenge(false);
      const level = levelsProgress.find((l) => l.levelNumber === targetLevelNum) || levelsProgress[0];
      startNewGame(level.size, level.targetSum, level.difficulty, 'classic');
    },
    [levelsProgress, startNewGame]
  );

  // Reset all progress back to zero
  const resetAllProgress = useCallback(() => {
    const freshLevels = generateCampaignLevels(48);
    setLevelsProgress(freshLevels);
    setUserProfile(DEFAULT_PROFILE);
    localStorage.removeItem('numtrix_campaign_levels');
    localStorage.removeItem('numtrix_levels_progress');
    localStorage.removeItem('sumoku_levels_progress');
    localStorage.removeItem('numtrix_profile');
    localStorage.removeItem('magicmatrix_profile');
    localStorage.removeItem('numtrix_daily_completed');
    localStorage.removeItem('sumoku_daily_completed');
    localStorage.removeItem('numtrix_has_played');
    startNewGame(freshLevels[0].size, freshLevels[0].targetSum, freshLevels[0].difficulty, 'classic');
    setCurrentScreen('home');
  }, [startNewGame]);

  // Start Daily Challenge
  const startDailyChallenge = useCallback(
    (day?: number) => {
      setCurrentLevelNumber(null);
      setIsDailyChallenge(true);
      // Daily challenge is 5x5 (target 65, values 1 to 25) with medium puzzle
      startNewGame(5, 65, 'medium', 'classic');
    },
    [startNewGame]
  );

  // Cell Selection (Upper box tap)
  const selectCell = (row: number, col: number) => {
    sound.playClick();
    setSelectedCell({ row, col });
    setConflictWarning(null);
  };

  // Enter Number from Keypad (Lower number set tap)
  // Strictly checks that numbers do not repeat ANYWHERE in the entire matrix!
  const enterNumber = (num: number) => {
    if (!selectedCell || isPaused) return;
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (cell.isGiven) return;

    // Pencil Notes Mode
    if (isPencilMode) {
      sound.playClick();
      const existingNotes = cell.notes || [];
      const updatedNotes = existingNotes.includes(num)
        ? existingNotes.filter((n) => n !== num)
        : [...existingNotes, num].sort((a, b) => a - b);

      setPuzzle((prev) => {
        const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        nextGrid[row][col].notes = updatedNotes;
        return { ...prev, grid: nextGrid };
      });
      return;
    }

    // Check for duplicate number ANYWHERE in the entire matrix
    let duplicateLoc: { row: number; col: number } | null = null;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if ((r !== row || c !== col) && puzzle.grid[r][c].value === num) {
          duplicateLoc = { row: r, col: c };
          break;
        }
      }
      if (duplicateLoc) break;
    }

    if (duplicateLoc) {
      sound.playWrong();
      setConflictWarning(
        `⚠️ Number ${num} is already used in Row ${duplicateLoc.row + 1}, Col ${duplicateLoc.col + 1}! Numbers cannot repeat in the matrix.`
      );
    } else {
      setConflictWarning(null);
    }

    // Direct Placement
    setHistory((prev) => [
      ...prev,
      { row, col, prevValue: cell.value, prevNotes: [...(cell.notes || [])] },
    ]);

    const isCorrect = num === cell.solutionValue;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setScore((prev) => prev + 150 + newStreak * 25);
      setCorrectCount((prev) => prev + 1);
      sound.playCorrect(newStreak);
    } else {
      sound.playWrong();
      setStreak(0);
      setWrongCount((prev) => prev + 1);
      if (selectedMode !== 'practice') {
        setLives((prev) => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            setTimeout(() => {
              stopTimer();
              setCurrentScreen('result');
            }, 600);
          }
          return nextLives;
        });
      }
    }

    setPuzzle((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[row][col].value = num;
      nextGrid[row][col].notes = [];
      nextGrid[row][col].isError = !isCorrect && autoCheckErrors;
      nextGrid[row][col].isDuplicate = !!duplicateLoc;
      return { ...prev, grid: nextGrid };
    });
  };

  // Erase Cell
  const eraseCell = () => {
    if (!selectedCell || isPaused) return;
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (cell.isGiven) return;

    sound.playClick();
    setConflictWarning(null);
    setHistory((prev) => [
      ...prev,
      { row, col, prevValue: cell.value, prevNotes: [...(cell.notes || [])] },
    ]);

    setPuzzle((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[row][col].value = null;
      nextGrid[row][col].notes = [];
      nextGrid[row][col].isError = false;
      nextGrid[row][col].isDuplicate = false;
      return { ...prev, grid: nextGrid };
    });
  };

  // Undo Move
  const undoMove = () => {
    if (history.length === 0 || isPaused) return;
    sound.playClick();
    setConflictWarning(null);
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setPuzzle((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[last.row][last.col].value = last.prevValue;
      nextGrid[last.row][last.col].notes = last.prevNotes;
      nextGrid[last.row][last.col].isError = false;
      nextGrid[last.row][last.col].isDuplicate = false;
      return { ...prev, grid: nextGrid };
    });
    setSelectedCell({ row: last.row, col: last.col });
  };

  // Use Hint
  const useHint = () => {
    if (hintsLeft <= 0 || !selectedCell || isPaused) return;
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (cell.isGiven || cell.value === cell.solutionValue) return;

    sound.playHint();
    setConflictWarning(null);
    setHintsLeft((prev) => prev - 1);
    setScore((prev) => Math.max(0, prev - 50));

    setPuzzle((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[row][col].value = cell.solutionValue;
      nextGrid[row][col].notes = [];
      nextGrid[row][col].isError = false;
      nextGrid[row][col].isDuplicate = false;
      return { ...prev, grid: nextGrid };
    });
  };

  const togglePencilMode = () => {
    sound.playClick();
    setIsPencilMode((prev) => !prev);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimer();
    } else {
      setIsPaused(true);
      stopTimer();
    }
    sound.playClick();
  };

  const restartGame = () => {
    startNewGame(puzzle.size, puzzle.targetSum, puzzle.difficulty, puzzle.mode);
  };

  const quitGame = () => {
    stopTimer();
    sound.playClick();
    setConflictWarning(null);
    setCurrentScreen('home');
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        puzzle,
        targetSum,
        setTargetSum,
        selectedSize,
        setSelectedSize,
        selectedMode,
        setSelectedMode,
        difficulty,
        setDifficulty,
        selectedCell,
        selectCell,
        enterNumber,
        eraseCell,
        isPencilMode,
        togglePencilMode,
        undoMove,
        canUndo: history.length > 0,
        useHint,
        hintsLeft,
        duplicateCells,
        rowHasDuplicates,
        colHasDuplicates,
        conflictWarning,
        clearConflictWarning,
        rowSums,
        colSums,
        diag1Sum,
        diag2Sum,
        isRowComplete,
        isColComplete,
        isDiag1Complete,
        isDiag2Complete,
        score,
        lives,
        maxLives,
        streak,
        timeElapsed,
        isPaused,
        togglePause,
        startNewGame,
        restartGame,
        quitGame,
        lastResult,
        levelsProgress,
        currentLevelNumber,
        startLevel,
        resetAllProgress,
        isDailyChallenge,
        startDailyChallenge,
        completedDailyDates,
        user,
        userProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleLoginWithGoogle,
        handleLogout,
        authLoading,
        soundEnabled,
        setSoundEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        isDarkMode,
        setIsDarkMode,
        toggleTheme,
        deviceFrame,
        setDeviceFrame,
        autoCheckErrors,
        setAutoCheckErrors,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
