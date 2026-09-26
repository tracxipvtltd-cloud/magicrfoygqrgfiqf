import { DailyChallengeType, DailyChallengeInfo, MatrixSize } from '../types';
import { getMagicSumForSize } from './magicMatrixEngine';

/**
  * Numtrix Progression & Scoring Engine
  * Implements exact mathematical formulas specified for 1,500 levels, player XP,
  * dynamic Daily Challenges, and star ratings.
  */

export const MAX_LEVEL = 1500;

/**
  * Difficulty formula:
  * "difficulty": "min(10, 1 + floor((L - 1) / 150))"
  */
export function calculateDifficulty(level: number): number {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  return Math.min(10, 1 + Math.floor((L - 1) / 150));
}

/**
  * Grid dimension formula:
  * "grid": "min(20, 4 + floor((L - 1) / 75))"
  */
export function calculateTheoreticalGrid(level: number): number {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  return Math.min(20, 4 + Math.floor((L - 1) / 75));
}

/**
  * Base level score formula:
  * "score": "round(100 + L * 18 + pow(L, 1.12) * 12 + D * 75)"
  */
export function calculateLevelScore(level: number): number {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  const D = calculateDifficulty(L);
  return Math.round(100 + L * 18 + Math.pow(L, 1.12) * 12 + D * 75);
}

/**
  * Base level XP formula:
  * "xp": "round(25 + L * 2.5 + pow(L, 1.08) * 4 + D * 12)"
  */
export function calculateLevelXP(level: number): number {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  const D = calculateDifficulty(L);
  return Math.round(25 + L * 2.5 + Math.pow(L, 1.08) * 4 + D * 12);
}

/**
  * Par moves formula:
  * "parMoves": "max(10, round(grid * grid * 0.7))"
  */
export function calculateParMoves(gridSize: number): number {
  const g = Math.max(3, gridSize);
  return Math.max(10, Math.round(g * g * 0.7));
}

/**
  * Star rating formula:
  * "3": "mistakes == 0 && moves <= parMoves"
  * "2": "mistakes <= 2 && moves <= parMoves * 1.25"
  * "1": "completed"
  */
export function calculateStars(
  completed: boolean,
  mistakes: number,
  moves: number,
  parMoves: number
): number {
  if (!completed) return 0;
  if (mistakes === 0 && moves <= parMoves) return 3;
  if (mistakes <= 2 && moves <= parMoves * 1.25) return 2;
  return 1;
}

/**
  * Cumulative XP required to reach player level P:
  * "xpRequired": "P <= 1 ? 0 : round(120 * pow(P - 1, 1.35) + 40 * (P - 1))"
  */
export function xpRequiredForLevel(playerLevel: number): number {
  if (playerLevel <= 1) return 0;
  const P = playerLevel;
  return Math.round(120 * Math.pow(P - 1, 1.35) + 40 * (P - 1));
}

export interface PlayerLevelInfo {
  playerLevel: number;
  totalXP: number;
  currentLevelBaseXP: number;
  nextLevelXP: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
}

/**
  * Player Level calculation:
  * "level": "largest P where xpRequired(P) <= totalXP"
  */
export function getPlayerLevelInfo(totalXP: number): PlayerLevelInfo {
  const xp = Math.max(0, totalXP);
  let p = 1;

  while (xpRequiredForLevel(p + 1) <= xp) {
    p++;
    if (p >= 1500) break; // Upper safety clamp
  }

  const currentLevelBaseXP = xpRequiredForLevel(p);
  const nextLevelXP = xpRequiredForLevel(p + 1);
  const xpInCurrentLevel = xp - currentLevelBaseXP;
  const xpNeededForNext = Math.max(1, nextLevelXP - currentLevelBaseXP);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  return {
    playerLevel: p,
    totalXP: xp,
    currentLevelBaseXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
  };
}

/**
  * Deterministic positive string hash function
  */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export const DAILY_CHALLENGE_TYPES: DailyChallengeType[] = [
  'speed',
  'perfect',
  'noMistakes',
  'limitedMoves',
  'rotationOnly',
  'reverse',
  'streak',
  'dailyGrid',
];

const DAILY_TYPE_DESCRIPTIONS: Record<DailyChallengeType, { title: string; desc: string }> = {
  speed: {
    title: 'Speed Rush',
    desc: 'Solve rapidly under par time for maximum speed bonuses!',
  },
  perfect: {
    title: 'Flawless Master',
    desc: 'Finish with 0 mistakes to claim a 3-star victory!',
  },
  noMistakes: {
    title: 'Sudden Death',
    desc: 'High stakes! Only 1 life allowed. Deduce carefully!',
  },
  limitedMoves: {
    title: 'Tactical Precision',
    desc: 'Every placement counts! Stay strictly under par moves.',
  },
  rotationOnly: {
    title: 'Matrix Harmony',
    desc: 'Balanced magic square symmetry with interconnected rows and columns.',
  },
  reverse: {
    title: 'Inverse Deduction',
    desc: 'Work backwards from peripheral row and column targets.',
  },
  streak: {
    title: 'Combo Cascade',
    desc: 'Chain consecutive correct number placements for massive combo points!',
  },
  dailyGrid: {
    title: 'Grand Matrix',
    desc: 'Pure magic square puzzle tuned specifically to your player level.',
  },
};

/**
  * Daily Challenge generator
  * "seed": "hash(YYYYMMDD + playerId)"
  * "type": "types[hash(seed) % types.length]"
  * "targetLevel": "clamp(round(playerLevel * 0.85) + floor(hash(seed) % 7) - 3, 1, 1500)"
  * "score": "levelScore(targetLevel) + round(50 + targetLevel * 0.15)"
  * "xp": "levelXP(targetLevel) + round(25 + targetLevel * 0.08)"
  * "streakBonus": "min(250, streak * 15)"
  */
export function generateDailyChallenge(
  dateStr: string, // YYYYMMDD
  playerId: string = 'player',
  playerLevel: number = 1,
  currentStreak: number = 0
): DailyChallengeInfo {
  const seed = hashString(`${dateStr}_${playerId}`);
  const typeIndex = hashString(`${seed}`) % DAILY_CHALLENGE_TYPES.length;
  const type = DAILY_CHALLENGE_TYPES[typeIndex];

  // targetLevel = clamp(round(playerLevel * 0.85) + floor(hash(seed) % 7) - 3, 1, 1500)
  const offset = (hashString(`${seed}_lvl`) % 7) - 3;
  const rawTargetLevel = Math.round(playerLevel * 0.85) + offset;
  const targetLevel = Math.min(1500, Math.max(1, rawTargetLevel));

  const baseScore = calculateLevelScore(targetLevel);
  const scoreReward = baseScore + Math.round(50 + targetLevel * 0.15);

  const baseXP = calculateLevelXP(targetLevel);
  const xpReward = baseXP + Math.round(25 + targetLevel * 0.08);

  // streakBonus: min(250, streak * 15)
  const streakBonus = Math.min(250, currentStreak * 15);

  // Determine playable matrix size based on targetLevel
  // 1-10: 3x3 or 4x4, 11-100: 4x4 or 5x5, 100+: 5x5 or 6x6
  let size: MatrixSize = 4;
  if (targetLevel <= 8) {
    size = 3;
  } else if (targetLevel <= 30) {
    size = 4;
  } else if (targetLevel <= 250) {
    size = 5;
  } else {
    size = 6;
  }

  const targetSum = getMagicSumForSize(size);
  const parMoves = calculateParMoves(size);

  const { title, desc } = DAILY_TYPE_DESCRIPTIONS[type];

  // Format display date: YYYY-MM-DD
  const displayDate = dateStr.length === 8 
    ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    : dateStr;

  return {
    dateStr,
    displayDate,
    type,
    title,
    description: desc,
    targetLevel,
    scoreReward,
    xpReward,
    streakBonus,
    parMoves,
    size,
    targetSum,
  };
}
