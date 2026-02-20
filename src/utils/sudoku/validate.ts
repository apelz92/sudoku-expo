/**
 * @fileoverview Validation and solving utilities for Sudoku boards.
 * Provides functions to validate partial and complete boards, solve puzzles using backtracking with MRV heuristic,
 * and count solutions. Uses bitmask constraints for efficient constraint propagation.
 */

import {Board, CellNum} from './types';
import {bitCount, getCandidates, initConstraints} from "./difficulty.ts";

// Precomputed bit-to-number table: bitToNum[1<<k] = k+1 for k=0..8
const bitToNum = new Uint8Array(512);
for (let k = 0; k < 9; k++) bitToNum[1 << k] = k + 1;

/**
 * Finds the empty cell with the Minimum Remaining Values (fewest candidates).
 * Uses MRV heuristic to select the most constrained empty cell for backtracking efficiency.
 * @param board - 9x9 Board to search
 * @param rowMask - Row constraint bitmasks
 * @param colMask - Column constraint bitmasks
 * @param boxMask - Box constraint bitmasks
 * @returns {{row: number, col: number, candidates: number} | null} Cell coordinates and candidate bitmask, or null if solved
 */
function findMRVCell(board: Board, rowMask: number[], colMask: number[], boxMask: number[]): { row: number, col: number, candidates: number } | null {
    let bestRow = -1, bestCol = -1, bestCount = 10, bestCandidates = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const cands = getCandidates(r, c, rowMask, colMask, boxMask);
                const count = bitCount(cands);
                if (count === 0) return { row: r, col: c, candidates: 0 }; // dead end
                if (count < bestCount) {
                    bestCount = count;
                    bestRow = r;
                    bestCol = c;
                    bestCandidates = cands;
                    if (count === 1) break;
                }
            }
        }
        if (bestCount === 1) break;
    }
    if (bestRow === -1) return null;
    return { row: bestRow, col: bestCol, candidates: bestCandidates };
}

/**
 * Common backtracking implementation for solving or counting solutions.
 * Recursively tries candidates for empty cells using MRV heuristic.
 * @param boardCopy - Mutable copy of the board
 * @param rowMask - Row constraint bitmasks (modified in place)
 * @param colMask - Column constraint bitmasks (modified in place)
 * @param boxMask - Box constraint bitmasks (modified in place)
 * @param onSolve - Callback invoked when a solution is found
 * @returns {boolean} true if a solution was found, false otherwise
 */
function backtrackImpl(boardCopy: Board, rowMask: number[], colMask: number[], boxMask: number[], onSolve: () => boolean): boolean {
    const cell = findMRVCell(boardCopy, rowMask, colMask, boxMask);
    if (!cell) return onSolve();
    const { row, col, candidates } = cell;
    if (candidates === 0) return false;
    const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    let cands = candidates;
    while (cands) {
        const bit = cands & -cands;
        cands &= cands - 1;
        boardCopy[row][col] = bitToNum[bit] as CellNum;
        rowMask[row] |= bit;
        colMask[col] |= bit;
        boxMask[boxIdx] |= bit;
        if (backtrackImpl(boardCopy, rowMask, colMask, boxMask, onSolve)) return true;
        boardCopy[row][col] = 0;
        rowMask[row] &= ~bit;
        colMask[col] &= ~bit;
        boxMask[boxIdx] &= ~bit;
    }
    return false;
}

/**
 * Solves a board using bitmask constraints and MRV heuristic.
 * Returns a solved copy of the board, or null if unsolvable.
 * @param board - 9x9 Board to solve (not modified)
 * @returns {Board | null} Solved board copy or null if no solution
 */
export function solveBoard(board: Board): Board | null {
    const boardCopy = board.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    const backtrack = () => backtrackImpl(boardCopy, rowMask, colMask, boxMask, () => true);
    return backtrack() ? boardCopy : null;
}

/**
 * Counts solutions for a board using bitmask constraints and MRV.
 * Stops early once maxCount solutions are found.
 * @param board - 9x9 Board (will NOT be modified - works on a copy)
 * @param maxCount - stop counting once this many solutions found (default 2)
 * @returns number of solutions found (up to maxCount)
 */
export function countSolutions(board: Board, maxCount: number = 2): number {
    const boardCopy = board.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    let count = 0;
    const backtrack = () => backtrackImpl(boardCopy, rowMask, colMask, boxMask, () => { count++; return count >= maxCount; });
    backtrack();
    return count;
}

/**
 * Checks if a value can be placed without violating uniqueness constraints.
 * Updates the seen mask if valid.
 * @param seenMask - Bitmask of values already seen in the current group
 * @param val - Value to check (0-9)
 * @param allowZero - Whether zero (empty) is allowed
 * @returns {{mask: number, valid: boolean}} Updated mask and validity status
 */
function checkValue(seenMask: number, val: number, allowZero: boolean): { mask: number, valid: boolean } {
    if (allowZero && val === 0) return { mask: seenMask, valid: true };
    const bit = 1 << (val - 1);
    if (seenMask & bit) return { mask: seenMask, valid: false };
    return { mask: seenMask | bit, valid: true };
}

/**
 * Validates partial Sudoku board has no rule violations.
 *
 * Checks all values 0-9, no duplicates in filled cells (1-9) across rows/cols/blocks.
 * Ignores 0s.
 *
 * @param board - 9x9 Board to validate.
 * @returns `boolean` - true if valid partial.
 *
 * @example
 * isValidPuzzle(puzzle); // true if no conflicts
 */
export function isValidPuzzle(board: Board): boolean {
    // Check digits 0-9
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];
            if (val < 0 || val > 9) return false;
        }
    }

    // Rows
    for (let r = 0; r < 9; r++) {
        let seenMask = 0;
        for (let c = 0; c < 9; c++) {
            const result = checkValue(seenMask, board[r][c], true);
            if (!result.valid) return false;
            seenMask = result.mask;
        }
    }

    // Columns (no allocations)
    for (let c = 0; c < 9; c++) {
        let seenMask = 0;
        for (let r = 0; r < 9; r++) {
            const result = checkValue(seenMask, board[r][c], true);
            if (!result.valid) return false;
            seenMask = result.mask;
        }
    }

    // Blocks (no allocations)
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let seenMask = 0;
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    const result = checkValue(seenMask, board[r][c], true);
                    if (!result.valid) return false;
                    seenMask = result.mask;
                }
            }
        }
    }

    return true;
}

/**
 * Validates fully solved Sudoku board follows all rules.
 *
 * All cells 1-9, no duplicates, each row/col/block has exactly 1-9.
 *
 * @param board - 9x9 Board to validate (fully filled).
 * @returns `boolean` - true if valid complete solution.
 *
 * @example
 * isValidBoard(solution); // true if valid
 */
export function isValidBoard(board: Board): boolean {
    // Check all digits 1-9, no zeros
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];
            if (val < 1 || val > 9) return false;
        }
    }

    // Rows
    for (let r = 0; r < 9; r++) {
        let seenMask = 0;
        for (let c = 0; c < 9; c++) {
            const result = checkValue(seenMask, board[r][c], false);
            if (!result.valid) return false;
            seenMask = result.mask;
        }
        if (seenMask !== 0x1FF) return false; // Ensure all 1-9 present
    }

    // Columns
    for (let c = 0; c < 9; c++) {
        let seenMask = 0;
        for (let r = 0; r < 9; r++) {
            const result = checkValue(seenMask, board[r][c], false);
            if (!result.valid) return false;
            seenMask = result.mask;
        }
        if (seenMask !== 0x1FF) return false;
    }

    // Blocks
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let seenMask = 0;
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    const result = checkValue(seenMask, board[r][c], false);
                    if (!result.valid) return false;
                    seenMask = result.mask;
                }
            }
            if (seenMask !== 0x1FF) return false;
        }
    }

    return true;
}