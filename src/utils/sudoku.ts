/**
 * @fileoverview Core Sudoku utilities for generating, validating, and solving Sudoku puzzles.
 * This module provides comprehensive functionality for Sudoku game logic including
 * puzzle generation with difficulty assessment, validation, and solving algorithms.
 * It serves as the main entry point for Sudoku-related operations in the application.
 */

/**
 * High-resolution timer function that uses performance.now() if available, otherwise falls back to Date.now().
 * @returns Current timestamp in milliseconds since the time origin.
 */
const now: () => number = typeof performance !== 'undefined' && typeof performance.now === 'function'
  ? performance.now.bind(performance)
  : Date.now;

import { Board, CellObject } from './sudoku/types';
import { fillGrid, removeCellsForUniqueOnce } from './sudoku/generator';
import { assessDifficulty, MAX_CLUES_BY_DIFFICULTY } from './sudoku/difficulty';
import { isValidBoard, isValidPuzzle, solveBoard, countSolutions } from './sudoku/validate';
import { cellsToBoard, boardToCells, indexToRowColumn, initGrid } from './sudoku/uiAdapter';
/**
 * Interface representing timing information for Sudoku puzzle generation phases.
 */
export interface BuildTimings {
    /** Time taken to fill the grid with a valid solution, in milliseconds. */
    fillGrid: number;
    /** Time taken to remove cells while maintaining uniqueness, in milliseconds. */
    removeCells: number;
    /** Time taken to assess the puzzle difficulty, in milliseconds. */
    assess: number;
}

/** Set to true to enable verbose generation logging in dev mode. */
let SUDOKU_VERBOSE = false;

/** Enable or disable verbose sudoku generation logs. */
export function setSudokuVerbose(enabled: boolean): void {
    SUDOKU_VERBOSE = enabled;
}

/**
 * Generates a Sudoku puzzle of specified difficulty, ensuring unique solution.
 *
 * Fills full board, removes cells to target clues, assesses difficulty.
 *
 * @param {number} difficulty - Level 0=easiest to 4=hardest.
 * @returns {{grid: CellObject[]; timings: BuildTimings}} Puzzle grid and timing metrics.
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

/**
 * Re-export of the fillGrid function from the generator module.
 */
export { fillGrid } from './sudoku/generator';

/**
 * Re-export of the assessDifficulty function from the difficulty module.
 */
export { assessDifficulty } from './sudoku/difficulty';

/**
 * Re-exports of validation functions from the validate module.
 * Includes board validation, puzzle validation, fast solving, and solution counting.
 */
export { isValidBoard, isValidPuzzle, solveBoard as fastSolve, countSolutions as fastCountSolutions } from './sudoku/validate';

/**
 * Re-exports of UI adapter functions from the uiAdapter module.
 * Includes cell value parsing, grid initialization, and coordinate conversions.
 */
export {parseCellValue, initGrid, cellsToBoard, indexToRowColumn, rowColumnToIndex } from './sudoku/uiAdapter';

/**
 * Re-export of the CellObject type from the types module.
 */
export { CellObject } from './sudoku/types';

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
