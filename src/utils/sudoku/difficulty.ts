import { Board, CellNum } from './types';

// Difficulty scoring constants
const DEPTH_BASELINE = 10;
const DEPTH_WEIGHT = 2.0;
const NAKED_SINGLE_WEIGHT = 0.5;
const CLUES_WEIGHT = 1.5;
const DIFFICULTY_THRESHOLDS = [10, 40, 100, 300]; // for levels 1-4

// Precomputed bit-to-number table: bitToNum[1<<k] = k+1 for k=0..8
const bitToNum = new Uint8Array(512);
for (let k = 0; k < 9; k++) bitToNum[1 << k] = k + 1;

/**
 * Initializes bitmask constraint arrays from a board state.
 *
 * Each mask is 9-bit: bit k set if digit (k+1) used.
 * Scans board, sets bits for non-zero cells.
 * Used by difficulty assessment solvers.
 *
 * @param board - `number[][]` - Initial board (partial or full).
 * @returns `{ rowMask: number[]; colMask: number[]; boxMask: number[] }` - 9 masks each.
 *
 * @example
 * const {rowMask} = initConstraints(board);
 * // rowMask[0] has bits for used digits in row 0
 */
function initConstraints(board: number[][]): { rowMask: number[], colMask: number[], boxMask: number[] } {
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
 * Computes bitmask of possible digits for a cell given constraints.
 *
 * Bits 0-8 correspond to digits 1-9. Available = ~(row | col | box) & 0x1FF.
 *
 * @param r - Row index (0-8).
 * @param c - Column index (0-8).
 * @param rowMask - Row masks.
 * @param colMask - Column masks.
 * @param boxMask - Box masks.
 * @returns `number` - Bitmask of candidates.
 *
 * @example
 * const cands = getCandidates(0, 0, rowMask, colMask, boxMask);
 * bitCount(cands); // e.g. 5 possible digits
 */
function getCandidates(r: number, c: number, rowMask: number[], colMask: number[], boxMask: number[]): number {
    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    return (~(rowMask[r] | colMask[c] | boxMask[boxIdx])) & 0x1FF;
}

/**
 * Counts set bits (population count) in a 9-bit mask using Kernighan algorithm.
 *
 * Efficient for small masks.
 *
 * @param mask - 9-bit integer mask.
 * @returns `number` - Number of 1-bits (0-9).
 *
 * @example
 * bitCount(0b101); // 2
 */
function bitCount(mask: number): number {
    let count = 0;
    let m = mask;
    while (m) {
        count++;
        m &= m - 1;
    }
    return count;
}

/**
 * Finds empty cell with Minimum Remaining Values (MRV heuristic), breaking ties randomly.
 *
 * Scans for 0 cells, computes candidates, selects lowest count (&lt;10).
 * Collects all with best count, picks randomly to reduce bias.
 * Immediate return if 0 candidates (dead-end). Returns null if solved.
 *
 * @param board - Current board copy.
 * @param rowMask - Row constraints.
 * @param colMask - Col constraints.
 * @param boxMask - Box constraints.
 * @param rng - Random number generator, defaults to Math.random.
 * @returns `{ row: number; col: number; candidates: number } | null` - Best cell or null.
 *
 * @example
 * const mrv = findMRVCell(boardCopy, rowMask, colMask, boxMask);
 * if (!mrv) console.log('solved');
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
 * Counts naked singles in the board deterministically.
 *
 * Naked single: empty cell with exactly one possible candidate.
 * Scans all empty cells, counts those with bitCount(candidates) === 1.
 *
 * @param board - `Board` - Puzzle board.
 * @returns `number` - Number of naked singles.
 *
 * @example
 * const singles = computeNakedSingles(puzzle);
 * console.log(singles); // e.g. 3
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
 * Solves board and collects deterministic solving metrics.
 *
 * Uses backtracking with MRV, tracks backtracks, max depth, nodes visited.
 * Non-mutating, works on copy.
 *
 * @param board - `Board` - Puzzle to solve.
 * @returns `{ backtracks: number; maxDepth: number; nodesVisited: number }` - Metrics.
 *
 * @example
 * const metrics = solveWithMetrics(puzzle);
 * console.log(metrics.backtracks); // e.g. 5
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
 * Assesses the difficulty of a puzzle using deterministic metrics.
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
    // Note: normalizedDepth = maxDepth / (81 - clues), but not used in score yet
    // Weighted score combining signals (kept compatible)
    const score = backtracks + Math.max(0, maxDepth - DEPTH_BASELINE) * DEPTH_WEIGHT - nakedSingles * NAKED_SINGLE_WEIGHT + (81 - clues) * CLUES_WEIGHT;
    let difficulty = 0;
    if (score > DIFFICULTY_THRESHOLDS[3]) difficulty = 4;
    else if (score > DIFFICULTY_THRESHOLDS[2]) difficulty = 3;
    else if (score > DIFFICULTY_THRESHOLDS[1]) difficulty = 2;
    else if (score > DIFFICULTY_THRESHOLDS[0]) difficulty = 1;
    return { difficulty, backtracks, maxDepth, nakedSingles, clues };
}