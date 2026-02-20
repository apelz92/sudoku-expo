import { Board, CellNum } from './types';

const DEPTH_BASELINE = 10;
const DEPTH_WEIGHT = 2.0;
const NAKED_SINGLE_WEIGHT = 0.5;
const CLUES_WEIGHT = 1.5;
const DIFFICULTY_THRESHOLDS = [10, 40, 100, 300]; // for levels 1-4

export const EASY_MAX_CLUES = 60;
export const HARD_MIN_CLUES = 20;
export const CLUES_STEP = (EASY_MAX_CLUES - HARD_MIN_CLUES) / 4;
export const MAX_CLUES_BY_DIFFICULTY = [60, 55, 50, 35, 25];

export const CLUE_RANGES_BY_DIFFICULTY = [
  { min: 55, max: 65 },
  { min: 45, max: 55 },
  { min: 35, max: 45 },
  { min: 25, max: 35 },
  { min: 17, max: 25 },
] as const;

const bitToNum = new Uint8Array(512);
for (let k = 0; k < 9; k++) bitToNum[1 << k] = k + 1;

/**
 * Initializes constraint masks for rows, columns, and boxes based on the current board state.
 * @param board - The current Sudoku board as a 2D array.
 * @returns An object containing rowMask, colMask, and boxMask arrays.
 */
export function initConstraints(board: number[][]): { rowMask: number[], colMask: number[], boxMask: number[] } {
    const rowMask = new Array(9).fill(0);
    const colMask = new Array(9).fill(0);
    const boxMask = new Array(9).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];
            if (val !== 0) {
                const bit = 1 << (val - 1);
                rowMask[r] |= bit;
                colMask[c] |= bit;
                boxMask[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= bit;
            }
        }
    }
    return { rowMask, colMask, boxMask };
}

/**
 * Gets the candidate numbers for a cell based on current constraints.
 * @param r - Row index.
 * @param c - Column index.
 * @param rowMask - Row constraint masks.
 * @param colMask - Column constraint masks.
 * @param boxMask - Box constraint masks.
 * @returns Bitmask of candidate numbers.
 */
export function getCandidates(r: number, c: number, rowMask: number[], colMask: number[], boxMask: number[]): number {
    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    return (~(rowMask[r] | colMask[c] | boxMask[boxIdx])) & 0x1FF;
}

/**
 * Counts the number of set bits in a bitmask.
 * @param mask - The bitmask.
 * @returns The number of set bits.
 */
export function bitCount(mask: number): number {
    let count = 0;
    let m = mask;
    while (m) {
        count++;
        m &= m - 1;
    }
    return count;
}

/**
 * Finds the cell with the minimum remaining values (MRV) heuristic.
 * @param board - The Sudoku board.
 * @param rowMask - Row constraint masks.
 * @param colMask - Column constraint masks.
 * @param boxMask - Box constraint masks.
 * @param rng - Random number generator function.
 * @returns The selected cell with candidates or null if no empty cells.
 */
function findMRVCell(board: number[][], rowMask: number[], colMask: number[], boxMask: number[], rng: () => number = Math.random): { row: number, col: number, candidates: number } | null {
    let bestCount = 10;
    const candidates: { row: number, col: number, candidates: number }[] = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const cands = getCandidates(r, c, rowMask, colMask, boxMask);
                const count = bitCount(cands);
                if (count === 0) return { row: r, col: c, candidates: 0 }; // dead end
                if (count < bestCount) {
                    bestCount = count;
                    candidates.length = 0;
                    candidates.push({ row: r, col: c, candidates: cands });
                } else if (count === bestCount) {
                    candidates.push({ row: r, col: c, candidates: cands });
                }
                if (bestCount === 1) break;
            }
        }
        if (bestCount === 1) break;
    }
    if (candidates.length === 0) return null;
    const selected = candidates[Math.floor(rng() * candidates.length)];
    return selected;
}

/**
 * Computes the number of naked singles in the board.
 * @param board - The Sudoku board.
 * @returns The number of naked singles.
 */
function computeNakedSingles(board: Board): number {
    const { rowMask, colMask, boxMask } = initConstraints(board);
    let count = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const cands = getCandidates(r, c, rowMask, colMask, boxMask);
                if (bitCount(cands) === 1) count++;
            }
        }
    }
    return count;
}

/**
 * Solves the Sudoku board using backtracking and collects solving metrics.
 * @param board - The Sudoku board.
 * @returns An object with backtracks, maxDepth, and nodesVisited.
 */
function solveWithMetrics(board: Board): { backtracks: number; maxDepth: number; nodesVisited: number } {
    let backtracks = 0;
    let maxDepth = 0;
    let currentDepth = 0;
    let nodesVisited = 0;
    const boardCopy = board.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    const solve = (): boolean => {
        const cell = findMRVCell(boardCopy, rowMask, colMask, boxMask, Math.random);
        if (!cell) return true;
        nodesVisited++;
        const { row, col, candidates } = cell;
        if (candidates === 0) return false;
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        let cands = candidates;
        while (cands) {
            const bit = cands & -cands;
            cands &= cands - 1;
            const num = bitToNum[bit];
            boardCopy[row][col] = num as CellNum;
            rowMask[row] |= bit;
            colMask[col] |= bit;
            boxMask[boxIdx] |= bit;
            if (solve()) return true;
            boardCopy[row][col] = 0;
            rowMask[row] &= ~bit;
            colMask[col] &= ~bit;
            boxMask[boxIdx] &= ~bit;
            backtracks++;
        }
        currentDepth--;
        return false;
    };
    solve();
    return { backtracks, maxDepth, nodesVisited };
}

/**
 * Assesses the difficulty of a Sudoku puzzle using backtracking metrics and heuristics.
 */
export function assessDifficulty(board: Board): { difficulty: number; backtracks: number; maxDepth: number; nakedSingles: number; clues: number } {
    let clues = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== 0) clues++;
        }
    }
    const nakedSingles = computeNakedSingles(board);
    const { backtracks, maxDepth, nodesVisited } = solveWithMetrics(board);
    const score = backtracks + Math.max(0, maxDepth - DEPTH_BASELINE) * DEPTH_WEIGHT - nakedSingles * NAKED_SINGLE_WEIGHT + (81 - clues) * CLUES_WEIGHT;
    let difficulty = 0;
    if (score > DIFFICULTY_THRESHOLDS[3]) difficulty = 4;
    else if (score > DIFFICULTY_THRESHOLDS[2]) difficulty = 3;
    else if (score > DIFFICULTY_THRESHOLDS[1]) difficulty = 2;
    else if (score > DIFFICULTY_THRESHOLDS[0]) difficulty = 1;
    return { difficulty, backtracks, maxDepth, nakedSingles, clues };
}
