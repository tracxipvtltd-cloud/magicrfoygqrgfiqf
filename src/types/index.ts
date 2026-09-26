export type GameMode = 'classic' | 'timed' | 'practice' | 'challenge';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard';

export type MatrixSize = 3 | 4 | 5 | 6;

export interface PuzzleCell {
  row: number;
  col: number;
  value: number | null; // null if empty
  solutionValue: number;
  isGiven: boolean; // pre-filled clue like Sudoku
  notes: number[]; // pencil notes
  isError?: boolean;
  isDuplicate?: boolean; // duplicate number in row or column
}

export interface NonogramLevel {
  levelNumber: number;
  size: MatrixSize;
  targetSum: number;
  difficulty: DifficultyLevel;
  difficultyRating?: number; // 1-10 formula: min(10, 1 + floor((L - 1) / 150))
  scoreReward?: number; // formula: round(100 + L * 18 + pow(L, 1.12) * 12 + D * 75)
  xpReward?: number; // formula: round(25 + L * 2.5 + pow(L, 1.08) * 4 + D * 12)
  parMoves?: number; // formula: max(10, round(grid * grid * 0.7))
  title: string;
  stars: number; // 0, 1, 2, 3
  isUnlocked: boolean;
  isCompleted: boolean;
  bestTime?: number;
}

export interface ValidationResult {
  rowSums: number[];
  colSums: number[];
  diag1Sum: number;
  diag2Sum: number;
  isRowComplete: boolean[];
  isColComplete: boolean[];
  isDiag1Complete: boolean;
  isDiag2Complete: boolean;
  rowHasDuplicates: boolean[];
  colHasDuplicates: boolean[];
  diag1HasDuplicates: boolean;
  diag2HasDuplicates: boolean;
  duplicateCells: { row: number; col: number }[];
  allLinesSatisfied: boolean;
  hasErrors: boolean;
}

export interface SudokuSumPuzzle {
  id: string;
  size: MatrixSize;
  targetSum: number; // e.g. 25
  mode: GameMode;
  difficulty: DifficultyLevel;
  grid: PuzzleCell[][];
  solution: number[][];
  maxNumber: number; // e.g. 9 for digits 1..9
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
  highestUnlockedLevel?: number;
  hintsLeft?: number;
  levelsCompletedTowardsHint?: number;
  completedLevelsData?: string;
  completedDailyDates?: string;
  dailyStreak?: number;
  lastDailyDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type DailyChallengeType = 
  | 'speed'
  | 'perfect'
  | 'noMistakes'
  | 'limitedMoves'
  | 'rotationOnly'
  | 'reverse'
  | 'streak'
  | 'dailyGrid';

export interface DailyChallengeInfo {
  dateStr: string; // YYYYMMDD
  displayDate: string; // YYYY-MM-DD
  type: DailyChallengeType;
  title: string;
  description: string;
  targetLevel: number;
  scoreReward: number;
  xpReward: number;
  streakBonus: number;
  parMoves: number;
  size: MatrixSize;
  targetSum: number;
}

export interface GameScoreRecord {
  scoreId: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  mode: GameMode;
  matrixSize: MatrixSize;
  targetSum: number;
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
  baseScore?: number;
  placementScore?: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  bestStreak: number;
  timeSeconds: number;
  speedBonus: number;
  baseXP?: number;
  speedXP?: number;
  xpEarned: number;
  isNewBest: boolean;
  matrixSize: MatrixSize;
  targetSum: number;
  mode: GameMode;
  difficulty: DifficultyLevel;
  levelNumber?: number;
  levelDifficulty?: number;
  movesCount?: number;
  parMoves?: number;
  starsEarned?: number;
  previousPlayerXP?: number;
  newPlayerXP?: number;
  previousPlayerLevel?: number;
  newPlayerLevel?: number;
  didLevelUp?: boolean;
  solvedGrid: number[][];
}
