import { Board } from './types';
import { shuffle } from './random';

import { CellNum } from './types';

/**
 * Generates permutation of row indices by shuffling bands and rows within bands.
 *
 * Shuffles band order (0,1,2), then for each band shuffles rows (0,1,2), appends to list.
 * Produces varied row ordering for board generation.
 *
 * @returns `number[]` - 9 row indices in permuted order.
 *
 * @example
 * const rows = permuteBands(); // e.g. [6,7,8,0,1,2,3,4,5]
 */
function permuteBands(): number[] {
    const bands = [0, 1, 2];
    shuffle(bands);
    const rows: number[] = [];
    for (const band of bands) {
        const within = [0, 1, 2];
        shuffle(within);
        for (const r of within) rows.push(band * 3 + r);
    }
    return rows;
}

/**
 * Generates permutation of column indices by shuffling stacks and columns within stacks.
 *
 * Shuffles stack order (0,1,2), then for each stack shuffles columns (0,1,2), appends to list.
 * Produces varied column ordering for board generation.
 *
 * @returns `number[]` - 9 column indices in permuted order.
 *
 * @example
 * const cols = permuteStacks(); // e.g. [3,4,5,0,1,2,6,7,8]
 */
function permuteStacks(): number[] {
    const stacks = [0, 1, 2];
    shuffle(stacks);
    const cols: number[] = [];
    for (const stack of stacks) {
        const within = [0, 1, 2];
        shuffle(within);
        for (const c of within) cols.push(stack * 3 + c);
    }
    return cols;
}

/**
 * Fills Sudoku board with valid solution using shuffled bands and stacks for variety.
 *
 * Uses base pattern ((r*3 + floor(r/3) + c) % 9) + 1, applies permuted rows and cols.
 * Always produces valid solution due to pattern properties.
 *
 * @returns `Board` - Fully filled valid Sudoku solution.
 *
 * @example
 * const solution = fillGrid();
 * console.log(isValidBoard(solution)); // true
 */
export function fillGrid(): Board {
    const base: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
    const pattern = (r: number, c: number) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
    const rows = permuteBands();
    const cols = permuteStacks();
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            base[rows[i]][cols[j]] = pattern(i, j) as CellNum;
        }
    }
    return base;
}

/**
 * Removes cells from solved Sudoku board in single pass to achieve unique solution with at least target clues.
 *
 * Shuffles indices 0-80, tries removing each cell once, restores if uniqueness lost (countSolutions(board, 2) !== 1).
 * Stops when clues <= targetClues.
 * Non-mutating, returns new board.
 *
 * @param solvedBoard - Fully solved `Board`.
 * @param targetClues - Minimum clues to retain.
 * @param countSolutions - Function to count solutions, with optional maxCount.
 * @returns `Board` - Puzzle with cells removed, unique solution.
 *
 * @example
 * const puzzle = removeCellsForUniqueOnce(solution, 40, fastCountSolutions);
 * console.log(fastCountSolutions(puzzle)); // 1
 */
export function removeCellsForUniqueOnce(
    solvedBoard: Board,
    targetClues: number,
    countSolutions: (board: Board, maxCount?: number) => number
): Board {
    const board = solvedBoard.map(row => [...row]);
    let clues = 81;
    const indices = Array.from({ length: 81 }, (_, i) => i);
    shuffle(indices);

    for (const idx of indices) {
        if (clues <= targetClues) break;
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        if (board[row][col] === 0) continue;
        const temp = board[row][col];
        board[row][col] = 0;
        if (countSolutions(board, 2) !== 1) {
            board[row][col] = temp; // restore
        } else {
            clues--;
        }
    }
    return board;
}