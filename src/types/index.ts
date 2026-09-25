export type GameMode = 'classic' | 'timed' | 'practice' | 'challenge';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type MatrixSize = 3 | 4 | 5 | 6 | 7 | 8;

export interface MatrixConfig {
  name: string;
  size: MatrixSize;
  orderLabel: string;
  magicConstant: number;
  lives: number;
  multiplier: number;
  tag?: string;
  isLocked?: boolean;
}

export interface MagicMatrixData {
  size: MatrixSize;
  cells: number[][];
  magicConstant: number;
  flatNumbers: number[];
  rowSums: number[];
  colSums: number[];
  diagSums: [number, number];
  isValid: boolean;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  level: number;
  xp: number;
  gamesPlayed: number;
  bestScore: number;
  bestStreak: number;
  totalCorrect: number;
  totalWrong: number;
  avgReactionTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameScoreRecord {
  scoreId: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  mode: GameMode;
  matrixSize: MatrixSize;
  score: number;
  accuracy: number;
  timeSeconds: number;
  maxStreak: number;
  createdAt: string;
}

export interface DailyChallengeRecord {
  recordId: string;
  userId: string;
  displayName: string;
  challengeDate: string;
  score: number;
  timeSeconds: number;
  completedAt: string;
}

export interface GameResult {
  score: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  bestStreak: number;
  timeSeconds: number;
  speedBonus: number;
  xpEarned: number;
  isNewBest: boolean;
  matrixSize: MatrixSize;
  magicConstant: number;
  mode: GameMode;
  solvedMatrix: MagicMatrixData;
}
