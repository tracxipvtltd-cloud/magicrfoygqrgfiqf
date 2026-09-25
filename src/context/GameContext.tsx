import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { 
  GameMode, 
  MatrixSize, 
  MagicMatrixData, 
  UserProfile, 
  GameScoreRecord, 
  GameResult,
  DailyChallengeRecord
} from '../types';
import { 
  generateMagicSquare, 
  SAMPLE_5X5, 
  getMagicConstant 
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

interface GameContextType {
  // Navigation & Screen
  currentScreen: 'home' | 'difficulty' | 'game' | 'result' | 'leaderboard';
  setCurrentScreen: (screen: 'home' | 'difficulty' | 'game' | 'result' | 'leaderboard') => void;
  activeTab: 'home' | 'play' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'play' | 'stats' | 'settings') => void;

  // Configuration
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
  selectedSize: MatrixSize;
  setSelectedSize: (size: MatrixSize) => void;

  // Active Game State
  matrix: MagicMatrixData;
  targetNumber: number;
  currentTargetIndex: number;
  totalTargets: number;
  score: number;
  streakBonus: number;
  lives: number;
  maxLives: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  hintsLeft: number;
  highlightedCell: number | null;
  isPaused: boolean;
  timeElapsed: number;
  lastClickedCell: { r: number; c: number; correct: boolean } | null;
  solvedCells: Set<number>;
  lastResult: GameResult | null;

  // Controls
  startNewGame: (mode?: GameMode, size?: MatrixSize) => void;
  handleCellTap: (val: number, r: number, c: number) => void;
  useHint: () => void;
  togglePause: () => void;
  restartGame: () => void;
  quitGame: () => void;
  proceedToNextDifficulty: () => void;

  // Auth & Profile
  user: User | null;
  userProfile: UserProfile;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  handleLoginWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
  authLoading: boolean;

  // Settings
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  deviceFrame: 'iphone' | 'fullscreen';
  setDeviceFrame: (val: 'iphone' | 'fullscreen') => void;
}

const DEFAULT_PROFILE: UserProfile = {
  userId: 'local_guest',
  displayName: 'Number Hunter',
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

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'home' | 'difficulty' | 'game' | 'result' | 'leaderboard'>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'play' | 'stats' | 'settings'>('home');

  // Mode & Size Selection
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedSize, setSelectedSize] = useState<MatrixSize>(5);

  // Settings
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'fullscreen'>('iphone');

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
    const saved = localStorage.getItem('magicmatrix_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_PROFILE;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem('magicmatrix_profile', JSON.stringify(profile));
          } else {
            // New user initial profile synced with Google Info
            const newProfile: UserProfile = {
              ...userProfile,
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Magic Hunter',
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || undefined,
              updatedAt: new Date().toISOString(),
            };
            setUserProfile(newProfile);
            await saveUserProfile(newProfile);
            localStorage.setItem('magicmatrix_profile', JSON.stringify(newProfile));
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
      const loggedUser = await loginWithGoogle();
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

  // Game Engine State
  const [matrix, setMatrix] = useState<MagicMatrixData>(SAMPLE_5X5);
  const [targetQueue, setTargetQueue] = useState<number[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [totalTargets, setTotalTargets] = useState(25);
  const [targetNumber, setTargetNumber] = useState(17);
  const [score, setScore] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastClickedCell, setLastClickedCell] = useState<{ r: number; c: number; correct: boolean } | null>(null);
  const [solvedCells, setSolvedCells] = useState<Set<number>>(new Set());
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Stop Timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start / Resume Timer
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => +(prev + 0.1).toFixed(1));
    }, 100);
  }, [stopTimer]);

  // Clean timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Initializing or starting a new game
  const startNewGame = useCallback((modeToPlay?: GameMode, sizeToPlay?: MatrixSize) => {
    const mode = modeToPlay || selectedMode;
    const size = sizeToPlay || selectedSize;

    setSelectedMode(mode);
    setSelectedSize(size);

    // Generate fresh authentic magic square
    const newMatrix = generateMagicSquare(size);
    setMatrix(newMatrix);

    // Determine lives based on difficulty/mode
    let initialLives = 3;
    if (mode === 'practice') initialLives = 999;
    else if (size === 3) initialLives = 5;
    else if (size === 4) initialLives = 4;
    else if (size === 5) initialLives = 3;
    else if (size === 6) initialLives = 3;
    else if (size >= 7) initialLives = 2;

    // Shuffle targets to find
    const allNums = [...newMatrix.flatNumbers];
    for (let i = allNums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNums[i], allNums[j]] = [allNums[j], allNums[i]];
    }

    const targetCount = mode === 'timed' ? Math.min(30, allNums.length) : allNums.length;
    const queue = allNums.slice(0, targetCount);

    setTargetQueue(queue);
    setCurrentTargetIndex(0);
    setTotalTargets(targetCount);
    setTargetNumber(queue[0]);
    setScore(0);
    setStreakBonus(0);
    setLives(initialLives);
    setMaxLives(initialLives);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setHintsLeft(3);
    setHighlightedCell(null);
    setIsPaused(false);
    setTimeElapsed(0);
    setLastClickedCell(null);
    setSolvedCells(new Set());

    setCurrentScreen('game');
    startTimer();
    sound.playClick();
  }, [selectedMode, selectedSize, startTimer]);

  // Finish Round
  const finishGame = useCallback((completed: boolean) => {
    stopTimer();

    const accuracy = totalTargets > 0 
      ? Math.round((correctCount / Math.max(correctCount + wrongCount, 1)) * 1000) / 10 
      : 100;
    
    const speedBonusCalc = Math.max(0, Math.round((60 - Math.min(timeElapsed, 55)) * 15));
    const finalScore = score + (completed ? 500 + speedBonusCalc : 0);
    const xpEarned = Math.round(finalScore / 10) + (completed ? 250 : 50);
    const isNewBest = finalScore > userProfile.bestScore;

    const result: GameResult = {
      score: finalScore,
      accuracy,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      bestStreak: maxStreak,
      timeSeconds: timeElapsed,
      speedBonus: speedBonusCalc,
      xpEarned,
      isNewBest,
      matrixSize: matrix.size,
      magicConstant: matrix.magicConstant,
      mode: selectedMode,
      solvedMatrix: matrix,
    };

    setLastResult(result);

    // Update User Profile
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
    localStorage.setItem('magicmatrix_profile', JSON.stringify(updatedProfile));

    // Async sync with Firestore if signed in
    if (user) {
      saveUserProfile(updatedProfile).catch((err) => console.warn('Cloud sync error:', err));

      const record: GameScoreRecord = {
        scoreId: `score_${Date.now()}_${user.uid.slice(0, 5)}`,
        userId: user.uid,
        displayName: user.displayName || userProfile.displayName,
        photoURL: user.photoURL || undefined,
        mode: selectedMode,
        matrixSize: matrix.size,
        score: finalScore,
        accuracy,
        timeSeconds: timeElapsed,
        maxStreak,
        createdAt: new Date().toISOString(),
      };
      recordMatchScore(record).catch((err) => console.warn('Record score error:', err));

      if (selectedMode === 'challenge') {
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyRecord: DailyChallengeRecord = {
          recordId: `${todayStr}_${user.uid}`,
          userId: user.uid,
          displayName: user.displayName || userProfile.displayName,
          challengeDate: todayStr,
          score: finalScore,
          timeSeconds: timeElapsed,
          completedAt: new Date().toISOString(),
        };
        recordDailyChallengeCompletion(dailyRecord).catch((err) => console.warn('Daily record error:', err));
      }
    }

    if (completed) {
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#22D3EE', '#22C55E', '#F59E0B'],
      });
    } else {
      sound.playWrong();
    }

    setCurrentScreen('result');
  }, [
    stopTimer, 
    totalTargets, 
    correctCount, 
    wrongCount, 
    timeElapsed, 
    score, 
    maxStreak, 
    userProfile, 
    matrix, 
    selectedMode, 
    user
  ]);

  // Cell Tap logic
  const handleCellTap = (val: number, r: number, c: number) => {
    if (isPaused) return;

    if (val === targetNumber) {
      // Correct!
      const newStreak = streak + 1;
      const newMaxStreak = Math.max(maxStreak, newStreak);
      setStreak(newStreak);
      setMaxStreak(newMaxStreak);

      const streakAdd = newStreak * 25;
      const basePoints = 100 * (selectedSize >= 5 ? 2 : 1.5);
      const earned = basePoints + streakAdd;

      setScore((prev) => prev + earned);
      setStreakBonus(streakAdd);
      setCorrectCount((prev) => prev + 1);
      setHighlightedCell(null);

      // Play audio chime
      sound.playCorrect(newStreak);

      // Mark cell as solved
      setSolvedCells((prev) => new Set(prev).add(val));
      setLastClickedCell({ r, c, correct: true });

      // Move to next target
      const nextIndex = currentTargetIndex + 1;
      if (nextIndex >= targetQueue.length) {
        // Solved all targets!
        finishGame(true);
      } else {
        setCurrentTargetIndex(nextIndex);
        setTargetNumber(targetQueue[nextIndex]);
      }
    } else {
      // Wrong answer
      sound.playWrong();
      setStreak(0);
      setStreakBonus(0);
      setWrongCount((prev) => prev + 1);
      setLastClickedCell({ r, c, correct: false });

      if (selectedMode !== 'practice') {
        const remainingLives = lives - 1;
        setLives(remainingLives);
        if (remainingLives <= 0) {
          finishGame(false);
        }
      }

      // Reset clicked cell flash after 350ms
      setTimeout(() => {
        setLastClickedCell((prev) => (prev && prev.r === r && prev.c === c ? null : prev));
      }, 400);
    }
  };

  // Hint
  const useHint = () => {
    if (hintsLeft <= 0 || isPaused) return;
    setHintsLeft((prev) => prev - 1);
    setHighlightedCell(targetNumber);
    sound.playHint();
  };

  // Pause
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
    startNewGame(selectedMode, selectedSize);
  };

  const quitGame = () => {
    stopTimer();
    sound.playClick();
    setCurrentScreen('home');
  };

  const proceedToNextDifficulty = () => {
    const sizes: MatrixSize[] = [3, 4, 5, 6, 7, 8];
    const currentIndex = sizes.indexOf(selectedSize);
    const nextSize = currentIndex < sizes.length - 1 ? sizes[currentIndex + 1] : sizes[0];
    startNewGame(selectedMode, nextSize);
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        selectedMode,
        setSelectedMode,
        selectedSize,
        setSelectedSize,
        matrix,
        targetNumber,
        currentTargetIndex,
        totalTargets,
        score,
        streakBonus,
        lives,
        maxLives,
        streak,
        maxStreak,
        correctCount,
        wrongCount,
        hintsLeft,
        highlightedCell,
        isPaused,
        timeElapsed,
        lastClickedCell,
        solvedCells,
        lastResult,
        startNewGame,
        handleCellTap,
        useHint,
        togglePause,
        restartGame,
        quitGame,
        proceedToNextDifficulty,
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
        deviceFrame,
        setDeviceFrame,
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
