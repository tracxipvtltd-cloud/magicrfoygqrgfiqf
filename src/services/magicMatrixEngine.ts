import { MatrixSize, DifficultyLevel, SudokuSumPuzzle, PuzzleCell, GameMode, ValidationResult, NonogramLevel } from '../types';

/**
 * Returns the exact magic sum for an N x N matrix with unique numbers 1 to N^2:
 * Sum formula: M = N * (N^2 + 1) / 2
 * - 3x3: 15 (numbers 1 to 9)
 * - 4x4: 34 (numbers 1 to 16)
 * - 5x5: 65 (numbers 1 to 25)
 * - 6x6: 111 (numbers 1 to 36)
 */
export function getMagicSumForSize(size: MatrixSize): number {
  switch (size) {
    case 3:
      return 15;
    case 4:
      return 34;
    case 5:
      return 65;
    case 6:
      return 111;
    default:
      return 65;
  }
}

export function getMaxNumberForSize(size: MatrixSize): number {
  return size * size;
}

/**
 * Validates whether a grid satisfies the target sum across all rows, columns, and main diagonals,
 * AND strictly enforces that numbers NEVER repeat in the entire matrix!
 * Values must be strictly between 1 and N x N (e.g. 1 to 25 for 5x5).
 */
export function validateBoardSums(grid: (number | null)[][], targetSum: number): ValidationResult {
  const n = grid.length;
  const maxVal = n * n;
  const rowSums = new Array(n).fill(0);
  const colSums = new Array(n).fill(0);
  const isRowComplete = new Array(n).fill(true);
  const isColComplete = new Array(n).fill(true);
  const rowHasDuplicates = new Array(n).fill(false);
  const colHasDuplicates = new Array(n).fill(false);
  let diag1Sum = 0;
  let diag2Sum = 0;
  let isDiag1Complete = true;
  let isDiag2Complete = true;
  let diag1HasDuplicates = false;
  let diag2HasDuplicates = false;

  const duplicateCellKeys = new Set<string>();

  // Global matrix value tracker: number -> array of {row, col}
  // Strictly enforces: numbers in the matrix should never repeat
  const matrixValueMap = new Map<number, { row: number; col: number }[]>();

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const val = grid[r][c];
      if (val === null || val === undefined) {
        isRowComplete[r] = false;
        isColComplete[c] = false;
        if (r === c) isDiag1Complete = false;
        if (r + c === n - 1) isDiag2Complete = false;
      } else {
        rowSums[r] += val;
        colSums[c] += val;
        if (r === c) diag1Sum += val;
        if (r + c === n - 1) diag2Sum += val;

        if (!matrixValueMap.has(val)) {
          matrixValueMap.set(val, [{ row: r, col: c }]);
        } else {
          matrixValueMap.get(val)!.push({ row: r, col: c });
        }
      }
    }
  }

  // Flag any duplicates across the entire matrix
  for (const [, cells] of matrixValueMap.entries()) {
    if (cells.length > 1) {
      for (const cell of cells) {
        duplicateCellKeys.add(`${cell.row},${cell.col}`);
        rowHasDuplicates[cell.row] = true;
        colHasDuplicates[cell.col] = true;
        if (cell.row === cell.col) diag1HasDuplicates = true;
        if (cell.row + cell.col === n - 1) diag2HasDuplicates = true;
      }
    }
  }

  // Check diagonals completion
  for (let i = 0; i < n; i++) {
    if (grid[i][i] === null || grid[i][i] === undefined) isDiag1Complete = false;
    const c = n - 1 - i;
    if (grid[i][c] === null || grid[i][c] === undefined) isDiag2Complete = false;
  }

  // Rows satisfied: complete, sum === targetSum, no row duplicates
  const rowsSatisfied = rowSums.every(
    (s, i) => isRowComplete[i] && s === targetSum && !rowHasDuplicates[i]
  );

  // Cols satisfied: complete, sum === targetSum, no col duplicates
  const colsSatisfied = colSums.every(
    (s, i) => isColComplete[i] && s === targetSum && !colHasDuplicates[i]
  );

  // Diagonals satisfied: complete, sum === targetSum, no diag duplicates
  const diagsSatisfied =
    isDiag1Complete &&
    diag1Sum === targetSum &&
    !diag1HasDuplicates &&
    isDiag2Complete &&
    diag2Sum === targetSum &&
    !diag2HasDuplicates;

  // Global uniqueness check: total filled cells must equal n*n and zero duplicates
  const totalFilled = Array.from(matrixValueMap.values()).reduce((acc, list) => acc + list.length, 0);
  const noDuplicatesAnywhere = duplicateCellKeys.size === 0;

  const allLinesSatisfied =
    rowsSatisfied &&
    colsSatisfied &&
    diagsSatisfied &&
    totalFilled === maxVal &&
    noDuplicatesAnywhere;

  const hasRowOverflow = rowSums.some((s) => s > targetSum);
  const hasColOverflow = colSums.some((s) => s > targetSum);
  const hasDiagOverflow = diag1Sum > targetSum || diag2Sum > targetSum;
  const hasAnyDuplicates = duplicateCellKeys.size > 0;

  const duplicateCells = Array.from(duplicateCellKeys).map((k) => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });

  return {
    rowSums,
    colSums,
    diag1Sum,
    diag2Sum,
    isRowComplete,
    isColComplete,
    isDiag1Complete,
    isDiag2Complete,
    rowHasDuplicates,
    colHasDuplicates,
    diag1HasDuplicates,
    diag2HasDuplicates,
    duplicateCells,
    allLinesSatisfied,
    hasErrors: hasRowOverflow || hasColOverflow || hasDiagOverflow || hasAnyDuplicates,
  };
}

/**
 * Symmetric transformation engine:
 * Preserves magic sums and uniqueness while providing infinite variations
 */
function transformMatrix(g: number[][], n: number): number[][] {
  let res = g.map((r) => [...r]);
  const maxVal = n * n;

  // 50% chance complement transformation: x -> (N^2 + 1 - x)
  if (Math.random() > 0.5) {
    res = res.map((row) => row.map((v) => maxVal + 1 - v));
  }

  // Random rotations (0, 90, 180, 270 degrees)
  const rots = Math.floor(Math.random() * 4);
  for (let i = 0; i < rots; i++) {
    res = res[0].map((_, col) => res.map((row) => row[col]).reverse());
  }

  // Random reflections
  if (Math.random() > 0.5) {
    res = res.reverse();
  }
  if (Math.random() > 0.5) {
    res = res.map((r) => r.reverse());
  }

  return res;
}

/**
 * 3x3 Magic Square Solution (values 1 to 9, sum = 15)
 */
export function generate3x3Solution(): number[][] {
  const base = [
    [8, 1, 6],
    [3, 5, 7],
    [4, 9, 2],
  ];
  return transformMatrix(base, 3);
}

/**
 * 4x4 Magic Square Solution (values 1 to 16, sum = 34)
 */
export function generate4x4Solution(): number[][] {
  const g = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (r === c || r + c === 3) {
        g[r][c] = 17 - g[r][c];
      }
    }
  }
  return transformMatrix(g, 4);
}

/**
 * 5x5 Magic Square Solution (values 1 to 25, sum = 65)
 * Using de la Loubère (Siamese) method
 */
export function generate5x5Solution(): number[][] {
  const n = 5;
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  let r = 0;
  let c = Math.floor(n / 2);

  for (let num = 1; num <= n * n; num++) {
    g[r][c] = num;
    const nextR = (r - 1 + n) % n;
    const nextC = (c + 1) % n;
    if (g[nextR][nextC] !== 0) {
      r = (r + 1) % n;
    } else {
      r = nextR;
      c = nextC;
    }
  }

  return transformMatrix(g, 5);
}

/**
 * 6x6 Magic Square Solution (values 1 to 36, sum = 111)
 * Using Strachey method with 3x3 sub-squares
 */
export function generate6x6Solution(): number[][] {
  const n = 6;
  const half = 3;
  const subA = [
    [8, 1, 6],
    [3, 5, 7],
    [4, 9, 2],
  ];
  const g = Array.from({ length: n }, () => Array(n).fill(0));

  for (let r = 0; r < half; r++) {
    for (let c = 0; c < half; c++) {
      const v = subA[r][c];
      g[r][c] = v; // Sub A: 1..9
      g[r + half][c + half] = v + 9; // Sub B: 10..18
      g[r][c + half] = v + 18; // Sub C: 19..27
      g[r + half][c] = v + 27; // Sub D: 28..36
    }
  }

  // Strachey swap for k = 1 (swap col 0 between A and D, except row 1 where we swap col 1)
  for (let r = 0; r < half; r++) {
    const colToSwap = r === 1 ? 1 : 0;
    const temp = g[r][colToSwap];
    g[r][colToSwap] = g[r + half][colToSwap];
    g[r + half][colToSwap] = temp;
  }

  return transformMatrix(g, 6);
}

/**
 * Master Numtrix Puzzle Generator
 * User Requirement:
 * "we are not randomly starting at something ley them build from the starting itself so start with zero and the size of the board should be given randomly by level"
 *
 * When startWithZero = true (default):
 * - Exactly ZERO pre-filled cells (the board starts completely blank)
 * - The player builds the matrix entirely from scratch by placing 1..N^2
 * - Every line must equal targetSum
 * - Numbers never repeat in the matrix
 */
export function createSudokuSumPuzzle(
  size: MatrixSize = 5,
  targetSum?: number,
  difficulty: DifficultyLevel = 'medium',
  mode: GameMode = 'classic',
  startWithZero = true
): SudokuSumPuzzle {
  const calculatedSum = getMagicSumForSize(size);
  const finalTarget = targetSum && targetSum === calculatedSum ? targetSum : calculatedSum;
  const maxNumber = getMaxNumberForSize(size);

  let solution: number[][];
  switch (size) {
    case 3:
      solution = generate3x3Solution();
      break;
    case 4:
      solution = generate4x4Solution();
      break;
    case 5:
      solution = generate5x5Solution();
      break;
    case 6:
      solution = generate6x6Solution();
      break;
    default:
      solution = generate5x5Solution();
      break;
  }

  // Build grid: when startWithZero is true, ZERO pre-filled givens!
  // The player builds the entire matrix from scratch!
  const grid: PuzzleCell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: PuzzleCell[] = [];
    for (let c = 0; c < size; c++) {
      const solVal = solution[r][c];
      row.push({
        row: r,
        col: c,
        value: startWithZero ? null : null,
        solutionValue: solVal,
        isGiven: false,
        notes: [],
        isError: false,
        isDuplicate: false,
      });
    }
    grid.push(row);
  }

  return {
    id: `numtrix_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    size,
    targetSum: finalTarget,
    mode,
    difficulty,
    grid,
    solution,
    maxNumber,
  };
}

/**
 * Procedural level configuration generator:
 * "the size of the board should be given randomly by level ok you got my point"
 *
 * Each level gets its matrix size (3×3, 4×4, 5×5, 6×6) assigned randomly/variedly per level,
 * with Level 1 starting at 3x3 to give a clean, approachable start from zero!
 */
export function getLevelConfig(levelNumber: number): { size: MatrixSize; difficulty: DifficultyLevel } {
  // Level 1: 3x3 gentle intro starter so they build from zero easily
  if (levelNumber === 1) {
    return { size: 3, difficulty: 'beginner' };
  }

  // All other levels: size is given randomly across 3x3, 4x4, 5x5, 6x6
  const availableSizes: MatrixSize[] = [3, 4, 5, 6];
  // Stable pseudo-random seed per level number to guarantee varied distribution
  const hash = Math.abs(Math.sin(levelNumber * 12.9898 + 78.233) * 43758.5453);
  const rand = hash - Math.floor(hash);

  const size = availableSizes[Math.floor(rand * availableSizes.length)];

  const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const difficulty = diffs[Math.floor((rand * 997) % diffs.length)];

  return { size, difficulty };
}

/**
 * Builds the campaign levels progression starting with zero:
 * - All levels have 0 stars
 * - All levels start uncompleted
 * - ONLY Stage 1 is unlocked
 * - Board sizes are assigned randomly by level!
 */
export function generateCampaignLevels(totalLevels = 48): NonogramLevel[] {
  return Array.from({ length: totalLevels }, (_, i) => {
    const levelNumber = i + 1;
    const { size, difficulty } = getLevelConfig(levelNumber);
    const targetSum = getMagicSumForSize(size);

    return {
      levelNumber,
      size,
      targetSum,
      difficulty,
      title: `Stage ${levelNumber}`,
      stars: 0,
      isUnlocked: levelNumber === 1,
      isCompleted: false,
      bestTime: undefined,
    };
  });
}
