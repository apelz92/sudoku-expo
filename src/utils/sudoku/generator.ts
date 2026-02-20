import { Board } from './types';
import { shuffle } from './random';
import { CellNum } from './types';

/**
 * Permutes the row bands for Sudoku generation.
 * @returns An array of permuted row indices.
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
 * Permutes the column stacks for Sudoku generation.
 * @returns An array of permuted column indices.
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
 * Generates a filled Sudoku grid.
 * @returns A complete Sudoku board.
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
 * Removes cells from a solved board to create a puzzle with a unique solution and target number of clues.
 * @param solvedBoard - The fully solved Sudoku board.
 * @param targetClues - The desired number of clues in the puzzle.
 * @param countSolutions - Function to count the number of solutions for a board.
 * @returns A Sudoku board with the target number of clues and a unique solution.
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
