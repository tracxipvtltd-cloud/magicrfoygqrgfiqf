import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  NonogramLevel,
  DailyChallengeInfo
} from '../types';
import { 
  createSudokuSumPuzzle, 
  validateBoardSums,
  getMagicSumForSize,
  getMaxNumberForSize,
  getLevelConfig,
  getLevelDescriptor,
  generateCampaignLevelsChunk
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
import {
  calculateDifficulty,
  calculateLevelScore,
  calculateLevelXP,
  calculateParMoves,
  calculateStars,
  getPlayerLevelInfo,
  PlayerLevelInfo,
  generateDailyChallenge,
  MAX_LEVEL
} from '../services/numtrixProgression';

interface HistoryEntry {
  row: number;
  col: number;
  prevValue: number | null;
  prevNotes: number[];
}

export const TOTAL_CAMPAIGN_LEVELS = MAX_LEVEL;

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

  // Grid Interaction
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
  levelsCompletedTowardsHint: number;
  earnedHintToast: boolean;
  dismissHintToast: () => void;

  // Duplicate conflict warning
  duplicateCells: { row: number; col: number }[];
  rowHasDuplicates: boolean[];
  colHasDuplicates: boolean[];
  conflictWarning: string | null;
  clearConflictWarning: () => void;

  // Line Sums & Status
  rowSums: number[];
  colSums: number[];
  diag1Sum: number;
  diag2Sum: number;
  isRowComplete: boolean[];
  isColComplete: boolean[];
  isDiag1Complete: boolean;
  isDiag2Complete: boolean;

  // Game Stats, Moves & Defeat handling
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  movesCount: number;
  parMoves: number;
  timeElapsed: number;
  isPaused: boolean;
  togglePause: () => void;
  isGameOver: boolean;
  gameOverReason: 'lives' | 'timeout' | null;
  startNewGame: (size?: MatrixSize, target?: number, diff?: DifficultyLevel, mode?: GameMode) => void;
  restartGame: () => void;
  restartLevel: () => void;
  reviveGame: () => void;
  quitGame: () => void;
  lastResult: GameResult | null;

  // Campaign Levels (1500+ levels)
  totalCampaignLevels: number;
  highestUnlockedLevel: number;
  completedLevelsMap: Record<number, { stars: number; bestTime?: number }>;
  levelsProgress: NonogramLevel[];
  currentLevelNumber: number | null;
  startLevel: (levelNumOrSize: MatrixSize | number, levelNumOpt?: number) => void;
  getLevelData: (levelNumber: number) => NonogramLevel;
  resetAllProgress: () => void;
  isDailyChallenge: boolean;
  startDailyChallenge: (day?: number) => void;
  completedDailyDates: string[];
  dailyChallengeInfo: DailyChallengeInfo;

  // Progression & Player Level
  playerLevelInfo: PlayerLevelInfo;
  currentLevelDifficulty: number;
  currentLevelBaseScore: number;
  currentLevelBaseXP: number;
  calculateLevelScore: (level: number) => number;
  calculateLevelXP: (level: number) => number;
  calculateDifficulty: (level: number) => number;
  calculateParMoves: (gridSize: number) => number;
  calculateStars: (completed: boolean, mistakes: number, moves: number, parMoves: number) => number;
  getPlayerLevelInfo: (totalXP: number) => PlayerLevelInfo;

  // Auth, Profile & Cloud Sync
  user: User | null;
  userProfile: UserProfile;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  handleLoginWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
  authLoading: boolean;
  cloudSyncStatus: 'synced' | 'saving' | 'offline' | 'local';

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
  level: 1,
  xp: 0,
  gamesPlayed: 0,
  bestScore: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  avgReactionTime: 0,
  highestUnlockedLevel: 1,
  hintsLeft: 3,
  levelsCompletedTowardsHint: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'home' | 'difficulty' | 'game' | 'result' | 'leaderboard' | 'daily'>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'daily' | 'play' | 'stats' | 'settings'>('home');

  // Firebase Auth & Cloud Sync
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'local'>('local');

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const s = localStorage.getItem('numtrix_sound');
    return s !== null ? s === 'true' : true;
  });
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const h = localStorage.getItem('numtrix_haptics');
    return h !== null ? h === 'true' : true;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('numtrix_theme');
    if (saved) return saved === 'dark';
    return false; // Default clean emerald mode
  });
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'fullscreen'>('iphone');
  const [autoCheckErrors, setAutoCheckErrors] = useState<boolean>(true);

  // Campaign State (1500+ Levels)
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('numtrix_highest_level');
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });

  const [completedLevelsMap, setCompletedLevelsMap] = useState<Record<number, { stars: number; bestTime?: number }>>(() => {
    try {
      const saved = localStorage.getItem('numtrix_completed_levels_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Hints System (Starts with 3 hints, earns +1 hint every 10 levels completed)
  const [hintsLeft, setHintsLeft] = useState<number>(() => {
    const saved = localStorage.getItem('numtrix_hints_left');
    return saved !== null ? Math.max(0, parseInt(saved, 10)) : 3;
  });

  const [levelsCompletedTowardsHint, setLevelsCompletedTowardsHint] = useState<number>(() => {
    const saved = localStorage.getItem('numtrix_levels_for_hint');
    return saved !== null ? Math.max(0, parseInt(saved, 10)) : 0;
  });

  const [earnedHintToast, setEarnedHintToast] = useState(false);

  const [currentLevelNumber, setCurrentLevelNumber] = useState<number | null>(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [completedDailyDates, setCompletedDailyDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('numtrix_daily_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Puzzle Configuration
  const [selectedSize, setSelectedSize] = useState<MatrixSize>(3);
  const [targetSum, setTargetSum] = useState<number>(15);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');

  // Master Puzzle State
  const [puzzle, setPuzzle] = useState<SudokuSumPuzzle>(() =>
    createSudokuSumPuzzle(3, 15, 'beginner', 'classic')
  );

  // User Interactive Selection
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Sums & duplicates tracking
  const [rowSums, setRowSums] = useState<number[]>([0, 0, 0]);
  const [colSums, setColSums] = useState<number[]>([0, 0, 0]);
  const [diag1Sum, setDiag1Sum] = useState<number>(0);
  const [diag2Sum, setDiag2Sum] = useState<number>(0);
  const [isRowComplete, setIsRowComplete] = useState<boolean[]>([false, false, false]);
  const [isColComplete, setIsColComplete] = useState<boolean[]>([false, false, false]);
  const [isDiag1Complete, setIsDiag1Complete] = useState<boolean>(false);
  const [isDiag2Complete, setIsDiag2Complete] = useState<boolean>(false);
  const [rowHasDuplicates, setRowHasDuplicates] = useState<boolean[]>([false, false, false]);
  const [colHasDuplicates, setColHasDuplicates] = useState<boolean[]>([false, false, false]);
  const [duplicateCells, setDuplicateCells] = useState<{ row: number; col: number }[]>([]);

  // Moves & Stats
  const [movesCount, setMovesCount] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'lives' | 'timeout' | null>(null);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  const timerRef = useRef<number | null>(null);

  // Calculated par moves for current puzzle
  const parMoves = useMemo(() => {
    return calculateParMoves(puzzle.size);
  }, [puzzle.size]);

  // Player Level & XP Info
  const playerLevelInfo = useMemo(() => {
    return getPlayerLevelInfo(userProfile.xp || 0);
  }, [userProfile.xp]);

  // Today's Daily Challenge configuration
  const todayDateStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }, []);

  const dailyChallengeInfo = useMemo(() => {
    const playerId = user ? user.uid : 'guest';
    const streakCount = userProfile.dailyStreak || 0;
    return generateDailyChallenge(todayDateStr, playerId, playerLevelInfo.playerLevel, streakCount);
  }, [todayDateStr, user, playerLevelInfo.playerLevel, userProfile.dailyStreak]);

  // Current Level Difficulty Rating (1 to 10): min(10, 1 + floor((L - 1) / 150))
  const currentLevelDifficulty = useMemo(() => {
    return calculateDifficulty(currentLevelNumber || 1);
  }, [currentLevelNumber]);

  // Current Level Base Score: round(100 + L * 18 + pow(L, 1.12) * 12 + D * 75)
  const currentLevelBaseScore = useMemo(() => {
    if (isDailyChallenge) {
      return dailyChallengeInfo.scoreReward;
    }
    return calculateLevelScore(currentLevelNumber || 1);
  }, [isDailyChallenge, dailyChallengeInfo.scoreReward, currentLevelNumber]);

  // Current Level Base XP: round(25 + L * 2.5 + pow(L, 1.08) * 4 + D * 12)
  const currentLevelBaseXP = useMemo(() => {
    if (isDailyChallenge) {
      return dailyChallengeInfo.xpReward + dailyChallengeInfo.streakBonus;
    }
    return calculateLevelXP(currentLevelNumber || 1);
  }, [isDailyChallenge, dailyChallengeInfo.xpReward, dailyChallengeInfo.streakBonus, currentLevelNumber]);

  // Apply dark mode class on html/body element
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

  // Auth observer & Cloud Sync Handler
  // User Requirement:
  // "everytime a person logins or installs we need to have him start from where he is if he was new just leave him alone but whenever a person already have made progress then they should continue from where the game has saved to cloud"
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(true);

      if (currentUser) {
        try {
          const cloudDoc = await fetchUserProfile(currentUser.uid);
          if (cloudDoc) {
            // Player already made progress in cloud! Restore their exact state!
            const cloudHighest = cloudDoc.highestUnlockedLevel || 1;
            const localHighest = parseInt(localStorage.getItem('numtrix_highest_level') || '1', 10);
            const resolvedHighest = Math.max(cloudHighest, localHighest);

            let resolvedCompletedMap: Record<number, { stars: number; bestTime?: number }> = {};
            try {
              const localMap = JSON.parse(localStorage.getItem('numtrix_completed_levels_map') || '{}');
              const cloudMap = cloudDoc.completedLevelsData ? JSON.parse(cloudDoc.completedLevelsData) : {};
              resolvedCompletedMap = { ...cloudMap, ...localMap };
            } catch (err) {
              console.warn('Completed levels map parse warning:', err);
            }

            const resolvedHints = cloudDoc.hintsLeft !== undefined 
              ? cloudDoc.hintsLeft 
              : parseInt(localStorage.getItem('numtrix_hints_left') || '3', 10);

            const resolvedLevelsForHint = cloudDoc.levelsCompletedTowardsHint !== undefined
              ? cloudDoc.levelsCompletedTowardsHint
              : parseInt(localStorage.getItem('numtrix_levels_for_hint') || '0', 10);

            const resolvedXP = Math.max(cloudDoc.xp || 0, userProfile.xp || 0);
            const resolvedPlayerLevel = getPlayerLevelInfo(resolvedXP).playerLevel;

            setHighestUnlockedLevel(resolvedHighest);
            setCompletedLevelsMap(resolvedCompletedMap);
            setHintsLeft(resolvedHints);
            setLevelsCompletedTowardsHint(resolvedLevelsForHint);

            localStorage.setItem('numtrix_highest_level', String(resolvedHighest));
            localStorage.setItem('numtrix_completed_levels_map', JSON.stringify(resolvedCompletedMap));
            localStorage.setItem('numtrix_hints_left', String(resolvedHints));
            localStorage.setItem('numtrix_levels_for_hint', String(resolvedLevelsForHint));

            const syncedProfile: UserProfile = {
              ...cloudDoc,
              userId: currentUser.uid,
              displayName: currentUser.displayName || cloudDoc.displayName || 'Numtrix Hunter',
              email: currentUser.email || cloudDoc.email || undefined,
              photoURL: currentUser.photoURL || cloudDoc.photoURL || undefined,
              highestUnlockedLevel: resolvedHighest,
              hintsLeft: resolvedHints,
              levelsCompletedTowardsHint: resolvedLevelsForHint,
              xp: resolvedXP,
              level: resolvedPlayerLevel,
              completedLevelsData: JSON.stringify(resolvedCompletedMap),
              updatedAt: new Date().toISOString(),
            };

            setUserProfile(syncedProfile);
            localStorage.setItem('numtrix_profile', JSON.stringify(syncedProfile));
            setCloudSyncStatus('synced');
          } else {
            // First time login for this Google Account:
            // Back up their local progress to the cloud so they never lose it!
            const newCloudProfile: UserProfile = {
              ...userProfile,
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Numtrix Hunter',
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || undefined,
              highestUnlockedLevel,
              hintsLeft,
              levelsCompletedTowardsHint,
              completedLevelsData: JSON.stringify(completedLevelsMap),
              completedDailyDates: JSON.stringify(completedDailyDates),
              level: getPlayerLevelInfo(userProfile.xp || 0).playerLevel,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUserProfile(newCloudProfile);
            await saveUserProfile(newCloudProfile);
            setCloudSyncStatus('synced');
          }
        } catch (e) {
          console.warn('Error syncing cloud profile:', e);
          setCloudSyncStatus('offline');
        }
      } else {
        // Not logged in:
        // "if he was new just leave him alone" - read from localStorage or keep clean guest state
        const local = localStorage.getItem('numtrix_profile');
        if (local) {
          try {
            setUserProfile(JSON.parse(local));
          } catch {
            setUserProfile(DEFAULT_PROFILE);
          }
        } else {
          setUserProfile(DEFAULT_PROFILE);
        }
        setCloudSyncStatus('local');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    try {
      setAuthLoading(true);
      const userRes = await loginWithGoogle();
      if (userRes) {
        sound.playVictory();
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      sound.playWrong();
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserProfile(DEFAULT_PROFILE);
      setIsAuthModalOpen(false);
      setCloudSyncStatus('local');
      sound.playClick();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

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

  // Dynamic helper for campaign levels
  const getLevelData = useCallback(
    (levelNum: number): NonogramLevel => {
      return getLevelDescriptor(levelNum, highestUnlockedLevel, completedLevelsMap);
    },
    [highestUnlockedLevel, completedLevelsMap]
  );

  // Expose a window of levels for backwards compatibility / home screen
  const levelsProgress = useMemo(() => {
    return generateCampaignLevelsChunk(1, 48, highestUnlockedLevel, completedLevelsMap);
  }, [highestUnlockedLevel, completedLevelsMap]);

  // Recalculate sums and check victory condition whenever puzzle grid changes
  useEffect(() => {
    if (isGameOver) return;

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

    // Sync duplicate highlight onto cells
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

    // Victory Condition: All lines satisfied AND all cells filled uniquely!
    if (val.allLinesSatisfied && !isGameOver) {
      handleGameWin();
    }
  }, [puzzle.grid, puzzle.targetSum, isGameOver]);

  // Win Handler - ONLY called when puzzle is legitimately completed!
  const handleGameWin = useCallback(() => {
    stopTimer();
    sound.playVictory();
    confetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#059669', '#F59E0B', '#6EE7B7'],
    });

    // Score & XP Formulas from user specification:
    // "score": "round(100 + L * 18 + pow(L, 1.12) * 12 + D * 75)"
    // "xp": "round(25 + L * 2.5 + pow(L, 1.08) * 4 + D * 12)"
    const levelToUse = currentLevelNumber || 1;
    const levelDiff = calculateDifficulty(levelToUse);
    const baseScore = isDailyChallenge 
      ? dailyChallengeInfo.scoreReward 
      : calculateLevelScore(levelToUse);
    const baseXP = isDailyChallenge 
      ? dailyChallengeInfo.xpReward + dailyChallengeInfo.streakBonus
      : calculateLevelXP(levelToUse);

    const speedBonus = Math.max(0, Math.round((120 - Math.min(timeElapsed, 110)) * 25));
    const speedXP = Math.round(speedBonus / 10);
    const placementScore = score;
    const finalScore = placementScore + baseScore + speedBonus;
    const accuracy = correctCount + wrongCount > 0 
      ? Math.round((correctCount / (correctCount + wrongCount)) * 1000) / 10 
      : 100;
    const xpEarned = baseXP + speedXP;
    const isNewBest = finalScore > userProfile.bestScore;

    // Stars Formula from user specification:
    // 3: mistakes == 0 && moves <= parMoves
    // 2: mistakes <= 2 && moves <= parMoves * 1.25
    // 1: completed
    const starsAwarded = calculateStars(true, wrongCount, movesCount, parMoves);

    // Player level & XP progression update using formulas
    const previousPlayerXP = userProfile.xp || 0;
    const previousPlayerLevel = userProfile.level || 1;
    const newTotalXP = previousPlayerXP + xpEarned;
    const newPlayerLevelInfo = getPlayerLevelInfo(newTotalXP);
    const newPlayerLevel = newPlayerLevelInfo.playerLevel;
    const didLevelUp = newPlayerLevel > previousPlayerLevel;

    // Update Campaign level progression up to 1500+
    let nextHighestUnlocked = highestUnlockedLevel;
    let nextCompletedLevelsMap = { ...completedLevelsMap };

    if (currentLevelNumber) {
      nextHighestUnlocked = Math.max(highestUnlockedLevel, currentLevelNumber + 1);
      setHighestUnlockedLevel(nextHighestUnlocked);
      localStorage.setItem('numtrix_highest_level', String(nextHighestUnlocked));

      nextCompletedLevelsMap = {
        ...completedLevelsMap,
        [currentLevelNumber]: {
          stars: Math.max(completedLevelsMap[currentLevelNumber]?.stars || 0, starsAwarded),
          bestTime: completedLevelsMap[currentLevelNumber]?.bestTime 
            ? Math.min(completedLevelsMap[currentLevelNumber].bestTime!, timeElapsed)
            : timeElapsed,
        },
      };
      setCompletedLevelsMap(nextCompletedLevelsMap);
      localStorage.setItem('numtrix_completed_levels_map', JSON.stringify(nextCompletedLevelsMap));
    }

    // Hint Reward System:
    // "the total number of hints must be only 3 and if needed more they need to complete 10 more levels to get one more hint as an option"
    let nextLevelsForHint = levelsCompletedTowardsHint + 1;
    let nextHintsLeft = hintsLeft;
    if (nextLevelsForHint >= 10) {
      nextHintsLeft += 1;
      nextLevelsForHint = 0;
      setEarnedHintToast(true);
      sound.playVictory();
    }
    setHintsLeft(nextHintsLeft);
    setLevelsCompletedTowardsHint(nextLevelsForHint);
    localStorage.setItem('numtrix_hints_left', String(nextHintsLeft));
    localStorage.setItem('numtrix_levels_for_hint', String(nextLevelsForHint));

    // Daily Challenge completion record
    let nextDailyDates = [...completedDailyDates];
    let nextDailyStreak = userProfile.dailyStreak || 0;
    if (isDailyChallenge) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (!nextDailyDates.includes(todayStr)) {
        nextDailyDates.push(todayStr);
        nextDailyStreak += 1;
        setCompletedDailyDates(nextDailyDates);
        localStorage.setItem('numtrix_daily_completed', JSON.stringify(nextDailyDates));
      }
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
      baseScore,
      placementScore,
      accuracy,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      bestStreak: Math.max(maxStreak, streak),
      timeSeconds: timeElapsed,
      speedBonus,
      baseXP,
      speedXP,
      xpEarned,
      isNewBest,
      matrixSize: puzzle.size,
      targetSum: puzzle.targetSum,
      mode: puzzle.mode,
      difficulty: puzzle.difficulty,
      levelNumber: currentLevelNumber || undefined,
      levelDifficulty: levelDiff,
      movesCount,
      parMoves,
      starsEarned: starsAwarded,
      previousPlayerXP,
      newPlayerXP: newTotalXP,
      previousPlayerLevel,
      newPlayerLevel,
      didLevelUp,
      solvedGrid: puzzle.grid.map((r) => r.map((c) => c.value || 0)),
    };

    setLastResult(result);
    setIsGameOver(false);

    const updatedProfile: UserProfile = {
      ...userProfile,
      gamesPlayed: userProfile.gamesPlayed + 1,
      xp: newTotalXP,
      level: newPlayerLevel,
      bestScore: Math.max(userProfile.bestScore, finalScore),
      bestStreak: Math.max(userProfile.bestStreak, maxStreak),
      totalCorrect: userProfile.totalCorrect + correctCount,
      totalWrong: userProfile.totalWrong + wrongCount,
      highestUnlockedLevel: nextHighestUnlocked,
      hintsLeft: nextHintsLeft,
      levelsCompletedTowardsHint: nextLevelsForHint,
      completedLevelsData: JSON.stringify(nextCompletedLevelsMap),
      completedDailyDates: JSON.stringify(nextDailyDates),
      dailyStreak: nextDailyStreak,
      avgReactionTime: correctCount > 0 
        ? Math.round((timeElapsed / correctCount) * 100) / 100 
        : userProfile.avgReactionTime,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('numtrix_profile', JSON.stringify(updatedProfile));

    // Real-time Cloud Save
    if (user) {
      setCloudSyncStatus('saving');
      saveUserProfile(updatedProfile)
        .then(() => setCloudSyncStatus('synced'))
        .catch((err) => {
          console.warn('Cloud sync error:', err);
          setCloudSyncStatus('offline');
        });

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
    movesCount,
    parMoves,
    maxStreak, 
    streak, 
    userProfile, 
    puzzle, 
    user,
    currentLevelNumber,
    isDailyChallenge,
    dailyChallengeInfo,
    highestUnlockedLevel,
    completedLevelsMap,
    completedDailyDates,
    hintsLeft,
    levelsCompletedTowardsHint
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
      setIsGameOver(false);
      setGameOverReason(null);

      const newPuzzle = createSudokuSumPuzzle(sz, tgt, diff, md);
      setPuzzle(newPuzzle);

      // Select first empty cell that is NOT a given
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
      setMovesCount(0);
      setHistory([]);
      setIsPaused(false);
      setTimeElapsed(0);

      setCurrentScreen('game');
      startTimer();
      sound.playClick();
    },
    [selectedSize, difficulty, selectedMode, startTimer]
  );

  // Start a specific Campaign Level (supporting 1 to 1500+ levels!)
  const startLevel = useCallback(
    (levelNumOrSize: MatrixSize | number, levelNumOpt?: number) => {
      const targetLevelNum = typeof levelNumOpt === 'number' ? levelNumOpt : (levelNumOrSize as number);
      setCurrentLevelNumber(targetLevelNum);
      setIsDailyChallenge(false);
      const config = getLevelConfig(targetLevelNum);
      const targetSumForSize = getMagicSumForSize(config.size);
      startNewGame(config.size, targetSumForSize, config.difficulty, 'classic');
    },
    [startNewGame]
  );

  // Restart current level
  const restartLevel = useCallback(() => {
    if (currentLevelNumber) {
      startLevel(currentLevelNumber);
    } else {
      startNewGame(puzzle.size, puzzle.targetSum, puzzle.difficulty, puzzle.mode);
    }
  }, [currentLevelNumber, startLevel, startNewGame, puzzle]);

  // Revive / Second Chance (+2 lives, resume puzzle)
  const reviveGame = useCallback(() => {
    sound.playClick();
    setLives(2);
    setIsGameOver(false);
    setGameOverReason(null);
    startTimer();
  }, [startTimer]);

  // Reset all progress back to zero
  const resetAllProgress = useCallback(() => {
    setHighestUnlockedLevel(1);
    setCompletedLevelsMap({});
    setHintsLeft(3);
    setLevelsCompletedTowardsHint(0);
    setUserProfile(DEFAULT_PROFILE);
    localStorage.removeItem('numtrix_highest_level');
    localStorage.removeItem('numtrix_completed_levels_map');
    localStorage.removeItem('numtrix_hints_left');
    localStorage.removeItem('numtrix_levels_for_hint');
    localStorage.removeItem('numtrix_profile');
    localStorage.removeItem('numtrix_daily_completed');
    startLevel(1);
    setCurrentScreen('home');
  }, [startLevel]);

  // Start Daily Challenge
  const startDailyChallenge = useCallback(
    () => {
      setCurrentLevelNumber(null);
      setIsDailyChallenge(true);
      const challenge = dailyChallengeInfo;
      const initialLives = challenge.type === 'noMistakes' ? 1 : 3;
      startNewGame(challenge.size, challenge.targetSum, 'medium', 'classic');
      setLives(initialLives);
      setMaxLives(initialLives);
    },
    [dailyChallengeInfo, startNewGame]
  );

  // Upper Box Cell Selection
  const selectCell = (row: number, col: number) => {
    sound.playClick();
    setSelectedCell({ row, col });
    setConflictWarning(null);
  };

  // Enter Number from Keypad Dock
  const enterNumber = (num: number) => {
    if (!selectedCell || isPaused || isGameOver) return;
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (cell.isGiven) return; // Clue cannot be modified

    // Increment move count
    setMovesCount((prev) => prev + 1);

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

    // Check for duplicate number in the matrix
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
        `⚠️ Number ${num} is already placed in Row ${duplicateLoc.row + 1}, Col ${duplicateLoc.col + 1}!`
      );
    } else {
      setConflictWarning(null);
    }

    // Record History
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
        const nextLives = lives - 1;
        setLives(nextLives);

        // When lives reach 0: OUT OF LIVES / DEFEAT!
        // Do NOT pass level! Show Game Over Defeat screen!
        if (nextLives <= 0) {
          stopTimer();
          setIsGameOver(true);
          setGameOverReason('lives');
          return;
        }
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
    if (!selectedCell || isPaused || isGameOver) return;
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
    if (history.length === 0 || isPaused || isGameOver) return;
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

  // Use Hint (Strictly limited to hintsLeft, persists to cloud and localStorage)
  const useHint = () => {
    if (hintsLeft <= 0 || !selectedCell || isPaused || isGameOver) return;
    const { row, col } = selectedCell;
    const cell = puzzle.grid[row][col];
    if (cell.isGiven || cell.value === cell.solutionValue) return;

    sound.playHint();
    setConflictWarning(null);
    const nextHints = Math.max(0, hintsLeft - 1);
    setHintsLeft(nextHints);
    localStorage.setItem('numtrix_hints_left', String(nextHints));

    if (user) {
      saveUserProfile({
        ...userProfile,
        hintsLeft: nextHints,
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Cloud sync hint error:', e));
    }

    setScore((prev) => Math.max(0, prev - 50));
    setMovesCount((prev) => prev + 1);

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
    setIsGameOver(false);
    setGameOverReason(null);
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
        levelsCompletedTowardsHint,
        earnedHintToast,
        dismissHintToast: () => setEarnedHintToast(false),
        duplicateCells,
        rowHasDuplicates,
        colHasDuplicates,
        conflictWarning,
        clearConflictWarning: () => setConflictWarning(null),
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
        movesCount,
        parMoves,
        timeElapsed,
        isPaused,
        togglePause,
        isGameOver,
        gameOverReason,
        startNewGame,
        restartGame,
        restartLevel,
        reviveGame,
        quitGame,
        lastResult,
        totalCampaignLevels: TOTAL_CAMPAIGN_LEVELS,
        highestUnlockedLevel,
        completedLevelsMap,
        levelsProgress,
        currentLevelNumber,
        startLevel,
        getLevelData,
        resetAllProgress,
        isDailyChallenge,
        startDailyChallenge,
        completedDailyDates,
        dailyChallengeInfo,
        playerLevelInfo,
        currentLevelDifficulty,
        currentLevelBaseScore,
        currentLevelBaseXP,
        calculateLevelScore,
        calculateLevelXP,
        calculateDifficulty,
        calculateParMoves,
        calculateStars,
        getPlayerLevelInfo,
        user,
        userProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleLoginWithGoogle,
        handleLogout,
        authLoading,
        cloudSyncStatus,
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
