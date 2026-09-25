import { MatrixSize, MagicMatrixData } from '../types';

export function getMagicConstant(n: MatrixSize): number {
  return (n * (n * n + 1)) / 2;
}

/**
 * Validates whether an n x n 2D array is a mathematically authentic normal magic square.
 */
export function validateMagicSquare(matrix: number[][]): {
  isValid: boolean;
  magicConstant: number;
  rowSums: number[];
  colSums: number[];
  diagSums: [number, number];
  uniqueCount: number;
} {
  const n = matrix.length;
  const magicConstant = getMagicConstant(n as MatrixSize);
  const totalCells = n * n;
  const seen = new Set<number>();
  const rowSums = new Array(n).fill(0);
  const colSums = new Array(n).fill(0);
  let diag1Sum = 0;
  let diag2Sum = 0;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const val = matrix[r][c];
      seen.add(val);
      rowSums[r] += val;
      colSums[c] += val;
      if (r === c) diag1Sum += val;
      if (r + c === n - 1) diag2Sum += val;
    }
  }

  const hasAllNumbers = seen.size === totalCells && Array.from(seen).every((v) => v >= 1 && v <= totalCells);
  const rowsValid = rowSums.every((s) => s === magicConstant);
  const colsValid = colSums.every((s) => s === magicConstant);
  const diagsValid = diag1Sum === magicConstant && diag2Sum === magicConstant;

  return {
    isValid: hasAllNumbers && rowsValid && colsValid && diagsValid,
    magicConstant,
    rowSums,
    colSums,
    diagSums: [diag1Sum, diag2Sum],
    uniqueCount: seen.size,
  };
}

/**
 * Generates an odd-order magic square (3, 5, 7) using the Siamese (de la Loubère) method.
 */
function generateOddOrder(n: number): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let row = 0;
  let col = Math.floor(n / 2);

  for (let num = 1; num <= n * n; num++) {
    grid[row][col] = num;
    const nextRow = (row - 1 + n) % n;
    const nextCol = (col + 1) % n;

    if (grid[nextRow][nextCol] !== 0) {
      row = (row + 1) % n;
    } else {
      row = nextRow;
      col = nextCol;
    }
  }

  return grid;
}

/**
 * Generates a doubly-even magic square (4, 8) using complementary diagonal inversion.
 */
function generateDoublyEvenOrder(n: number): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  let count = 1;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      grid[r][c] = count++;
    }
  }

  // 4x4 sub-blocks condition for doubly-even inversion
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inMainDiagonal = r % 4 === c % 4;
      const inAntiDiagonal = (r % 4) + (c % 4) === 3;
      if (inMainDiagonal || inAntiDiagonal) {
        grid[r][c] = n * n + 1 - grid[r][c];
      }
    }
  }

  return grid;
}

/**
 * Generates a singly-even magic square (order 6) using the Strachey method.
 */
function generateSinglyEven6(): number[][] {
  const n = 6;
  const half = 3;
  const subSquare = generateOddOrder(half); // 3x3 magic square with 1..9
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const subSize = half * half;

  // Fill 4 quadrants:
  // Top-left: A (1..9)
  // Bottom-right: B (10..18)
  // Top-right: C (19..27)
  // Bottom-left: D (28..36)
  for (let r = 0; r < half; r++) {
    for (let c = 0; c < half; c++) {
      grid[r][c] = subSquare[r][c]; // A
      grid[r + half][c + half] = subSquare[r][c] + subSize; // B
      grid[r][c + half] = subSquare[r][c] + 2 * subSize; // C
      grid[r + half][c] = subSquare[r][c] + 3 * subSize; // D
    }
  }

  // Strachey swap rules for n=6 (k = (n - 2) / 4 = 1)
  // Swap k columns on the left between A and D, except swap column index 1 in middle row
  for (let r = 0; r < half; r++) {
    for (let c = 0; c < 1; c++) {
      if (r === 1) {
        // middle row swap column 1
        const temp = grid[r][1];
        grid[r][1] = grid[r + half][1];
        grid[r + half][1] = temp;
      } else {
        const temp = grid[r][c];
        grid[r][c] = grid[r + half][c];
        grid[r + half][c] = temp;
      }
    }
  }

  return grid;
}

/**
 * Applies a random symmetry (rotation or reflection) to preserve magic square properties while providing endless variety.
 */
function applyRandomSymmetry(matrix: number[][]): number[][] {
  const n = matrix.length;
  let result = matrix.map((row) => [...row]);
  const rotations = Math.floor(Math.random() * 4);

  // Rotate 90 degrees clockwise `rotations` times
  for (let rot = 0; rot < rotations; rot++) {
    const next: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        next[c][n - 1 - r] = result[r][c];
      }
    }
    result = next;
  }

  // 50% chance horizontal flip
  if (Math.random() > 0.5) {
    result = result.map((row) => [...row].reverse());
  }

  // 50% chance complement inversion: val -> n^2 + 1 - val (valid for all magic squares)
  if (Math.random() > 0.5) {
    const total = n * n + 1;
    result = result.map((row) => row.map((v) => total - v));
  }

  return result;
}

/**
 * Master generator function for MagicMatrix.
 */
export function generateMagicSquare(order: MatrixSize): MagicMatrixData {
  let rawGrid: number[][];

  if (order % 2 === 1) {
    rawGrid = generateOddOrder(order);
  } else if (order % 4 === 0) {
    rawGrid = generateDoublyEvenOrder(order);
  } else {
    // 6x6
    rawGrid = generateSinglyEven6();
  }

  // Apply symmetry transformations for fresh board layouts
  const randomizedGrid = applyRandomSymmetry(rawGrid);
  const validation = validateMagicSquare(randomizedGrid);

  const flatNumbers = randomizedGrid.flat();

  return {
    size: order,
    cells: randomizedGrid,
    magicConstant: validation.magicConstant,
    flatNumbers,
    rowSums: validation.rowSums,
    colSums: validation.colSums,
    diagSums: validation.diagSums,
    isValid: validation.isValid,
  };
}

/**
 * Predefined matrix for instant previews or onboarding
 */
export const SAMPLE_3X3: MagicMatrixData = {
  size: 3,
  cells: [
    [8, 1, 6],
    [3, 5, 7],
    [4, 9, 2],
  ],
  magicConstant: 15,
  flatNumbers: [8, 1, 6, 3, 5, 7, 4, 9, 2],
  rowSums: [15, 15, 15],
  colSums: [15, 15, 15],
  diagSums: [15, 15],
  isValid: true,
};

export const SAMPLE_4X4: MagicMatrixData = {
  size: 4,
  cells: [
    [16, 3, 2, 13],
    [5, 10, 11, 8],
    [9, 6, 7, 12],
    [4, 15, 14, 1],
  ],
  magicConstant: 34,
  flatNumbers: [16, 3, 2, 13, 5, 10, 11, 8, 9, 6, 7, 12, 4, 15, 14, 1],
  rowSums: [34, 34, 34, 34],
  colSums: [34, 34, 34, 34],
  diagSums: [34, 34],
  isValid: true,
};

export const SAMPLE_5X5: MagicMatrixData = {
  size: 5,
  cells: [
    [3, 16, 9, 22, 15],
    [20, 8, 21, 14, 2],
    [7, 25, 13, 1, 19],
    [24, 12, 5, 18, 6],
    [11, 4, 17, 10, 23],
  ],
  magicConstant: 65,
  flatNumbers: [
    3, 16, 9, 22, 15,
    20, 8, 21, 14, 2,
    7, 25, 13, 1, 19,
    24, 12, 5, 18, 6,
    11, 4, 17, 10, 23,
  ],
  rowSums: [65, 65, 65, 65, 65],
  colSums: [65, 65, 65, 65, 65],
  diagSums: [65, 65],
  isValid: true,
};
