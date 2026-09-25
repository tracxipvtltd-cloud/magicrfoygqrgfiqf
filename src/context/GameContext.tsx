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
  getMaxNumberForSize
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

  // Nonogram Level Progression
  levelsProgress: Record<MatrixSize, NonogramLevel[]>;
  currentLevelNumber: number | null;
  startLevel: (size: MatrixSize, levelNum: number) => void;
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

const DEFAULT_PROFILE: UserProfile = {
  userId: 'local_guest',
  displayName: 'Numtrix Hunter',
  level: 12,
  xp: 3240,
  gamesPlayed: 142,
  bestScore: 4850,
  bestStreak: 24,
  totalCorrect: 1280,
  totalWrong: 52,
  avgReactionTime: 1.42,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial 12 levels for each matrix size in true Nonogram style
function generateInitialLevels(size: MatrixSize): NonogramLevel[] {
  const targetSum = getMagicSumForSize(size);
  const diffs: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard'];
  return Array.from({ length: 12 }, (_, i) => {
    const levelNumber = i + 1;
    const diffIndex = Math.min(3, Math.floor(i / 3));
    return {
      levelNumber,
      size,
      targetSum,
      difficulty: diffs[diffIndex],
      title: `Stage ${levelNumber}`,
      stars: levelNumber <= 2 ? 3 : levelNumber === 3 ? 2 : 0,
      isUnlocked: levelNumber <= 4,
      isCompleted: levelNumber <= 3,
      bestTime: levelNumber <= 3 ? 45 + levelNumber * 12 : undefined,
    };
  });
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation: Nonogram structure (home/levels, daily, difficulty/play, game, result, leaderboard)
  const [currentScreen, setCurrentScreen] = useState<'home' | 'difficulty' | 'game' | 'result' | 'leaderboard' | 'daily'>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'daily' | 'play' | 'stats' | 'settings'>('home');

  // Math rule: 5x5 has values 1..25 and target sum 65; 4x4 has values 1..16 and target sum 34; etc.
  const [selectedSize, setSelectedSize] = useState<MatrixSize>(5);
  const [targetSum, setTargetSum] = useState<number>(65);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  // Level Progression & Daily Challenge
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number | null>(1);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);

  const [levelsProgress, setLevelsProgress] = useState<Record<MatrixSize, NonogramLevel[]>>(() => {
    const saved = localStorage.getItem('numtrix_levels_progress') || localStorage.getItem('sumoku_levels_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure targets are updated to correct magic sums
        if (parsed[5] && parsed[5][0]?.targetSum === 25) {
          // migrate from old targetSum 25 to 65
          parsed[5] = parsed[5].map((lvl: NonogramLevel) => ({ ...lvl, targetSum: 65 }));
        }
        if (parsed[4] && parsed[4][0]?.targetSum === 16) {
          parsed[4] = parsed[4].map((lvl: NonogramLevel) => ({ ...lvl, targetSum: 34 }));
        }
        if (parsed[6] && parsed[6][0]?.targetSum === 36) {
          parsed[6] = parsed[6].map((lvl: NonogramLevel) => ({ ...lvl, targetSum: 111 }));
        }
        if (parsed[3] && parsed[3][0]?.targetSum === 9) {
          parsed[3] = parsed[3].map((lvl: NonogramLevel) => ({ ...lvl, targetSum: 15 }));
        }
        return parsed;
      } catch {
        /* fallback */
      }
    }
    return {
      5: generateInitialLevels(5),
      4: generateInitialLevels(4),
      6: generateInitialLevels(6),
      3: generateInitialLevels(3),
    };
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
      try { return JSON.parse(saved); } catch { /* ignore */ }
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

  // Puzzle State: Default 5x5 with target sum 65 (numbers 1 to 25)
  const [puzzle, setPuzzle] = useState<SudokuSumPuzzle>(() =>
    createSudokuSumPuzzle(5, 65, 'medium', 'classic')
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
      setLevelsProgress((prev) => {
        const currentList = prev[puzzle.size] || [];
        const updatedList = currentList.map((lvl) => {
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
        const nextState = { ...prev, [puzzle.size]: updatedList };
        localStorage.setItem('sumoku_levels_progress', JSON.stringify(nextState));
        return nextState;
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

  // Start a specific Nonogram level
  const startLevel = useCallback(
    (size: MatrixSize, levelNum: number) => {
      setCurrentLevelNumber(levelNum);
      setIsDailyChallenge(false);
      const target = getMagicSumForSize(size);
      const diffs: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard'];
      const diff = diffs[Math.min(3, Math.floor((levelNum - 1) / 3))];
      startNewGame(size, target, diff, 'classic');
    },
    [startNewGame]
  );

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
