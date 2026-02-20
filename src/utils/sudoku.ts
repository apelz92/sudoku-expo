/**
 * @desc basic sudoku logic that can generate and solve sudoku boards
 * TODO
 **/

const now: () => number = typeof performance !== 'undefined' && typeof performance.now === 'function'
  ? performance.now.bind(performance)
  : Date.now;

import { Board, CellObject } from './sudoku/types';
import { fillGrid, removeCellsForUniqueOnce } from './sudoku/generator';
import { assessDifficulty, MAX_CLUES_BY_DIFFICULTY } from './sudoku/difficulty';
import { isValidBoard, isValidPuzzle, solveBoard, countSolutions } from './sudoku/validate';
import { cellsToBoard, boardToCells, indexToRowColumn, initGrid } from './sudoku/uiAdapter';
export interface BuildTimings {
    fillGrid: number;
    removeCells: number;
    assess: number;
}

/** Set to true to enable verbose generation logging in dev mode. */
let SUDOKU_VERBOSE = false;

/** Enable or disable verbose sudoku generation logs. */
export function setSudokuVerbose(enabled: boolean): void {
    SUDOKU_VERBOSE = enabled;
}

/**
 * Build a Sudoku puzzle with a desired difficulty (0-4).
 * Generates a full solved board, then removes numbers while guaranteeing a unique solution.
 * The difficulty determines the target number of visible clues and is verified by complexity analysis.
 * @param difficulty - integer between 0 (easiest) and 4 (hardest)
 * @returns Array of Cell representing the puzzle
 */
export function buildSudoku(difficulty: number): { grid: CellObject[]; timings: BuildTimings } {
    if (Number.isNaN(difficulty)) {
        difficulty = 0;
    }
    difficulty = Math.round(difficulty);
    difficulty = Math.max(0, Math.min(4, difficulty));
    const _timings: BuildTimings = { fillGrid: 0, removeCells: 0, assess: 0 };

    const fillStart = now();
    const fullBoard = fillGrid();
    _timings.fillGrid = now() - fillStart;

    const targetClues = MAX_CLUES_BY_DIFFICULTY[difficulty];

    const removeStart = now();
    const puzzleBoard = removeCellsForUniqueOnce(fullBoard, targetClues, countSolutions);
    _timings.removeCells = now() - removeStart;

    const assessStart = now();
    const assessment = assessDifficulty(puzzleBoard);
    _timings.assess = now() - assessStart;
    console.log("puzzle difficulty", { assessment, puzzleBoard });

    const grid = boardToCells(puzzleBoard, fullBoard);

    return { grid, timings: _timings };
}

/**
 * Checks if the provided grid is a valid Sudoku puzzle (no rule violations).
 * @param grid - The Sudoku grid to check
 * @returns true if the grid is valid, false otherwise
 */
export function checkGrid(grid: CellObject[]): boolean {
    const board = cellsToBoard(grid);
    return isValidPuzzle(board);
}

export { fillGrid } from './sudoku/generator';

export { assessDifficulty } from './sudoku/difficulty';

export { isValidBoard, isValidPuzzle, solveBoard as fastSolve, countSolutions as fastCountSolutions } from './sudoku/validate';

export {parseCellValue, initGrid, cellsToBoard, indexToRowColumn, rowColumnToIndex } from './sudoku/uiAdapter';

export { CellObject } from './sudoku/types.ts';

/**
 * Solves the provided grid and returns a solved copy.
 * The original grid is left untouched.
 * @param grid - Puzzle state to solve
 * @returns Solved grid cells with all numbers populated and read-only
 */
export function solve(grid: CellObject[]): CellObject[] {
    const board = cellsToBoard(grid);
    const solved = solveBoard(board);
    if (!solved) {
        return grid.map(cell => ({ ...cell }));
    }
    return grid.map((cell) => {
        const { row, column } = indexToRowColumn(cell.index);
        const solvedValue = solved[row][column];
        return {
            ...cell,
            value: String(solvedValue),
            hiddenValue: String(solvedValue),
            isVisible: true,
            isReadOnly: true,
        };
    });
}
