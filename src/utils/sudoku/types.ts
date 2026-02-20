/**
 * @fileoverview Defines core types and interfaces for Sudoku board representation and validation.
 * This module provides TypeScript types for representing Sudoku digits, cells, boards, and constraints
 * used throughout the Sudoku generation, validation, and UI adaptation logic.
 */

/** Represents a valid Sudoku digit from 1 to 9. */
export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/** Represents a cell value, either 0 (empty) or a SudokuDigit. */
export type CellNum = 0 | SudokuDigit;
/** A 9x9 grid of CellNum values representing a Sudoku board. */
export type Board = CellNum[][];

/** Constraints tracking used digits in rows, columns, and 3x3 boxes using 9-bit bitmasks (bit k set for digit k+1). */
export interface Constraints {
  /** Bitmasks for each row indicating used digits. */
  rowMask: number[];
  /** Bitmasks for each column indicating used digits. */
  colMask: number[];
  /** Bitmasks for each 3x3 box indicating used digits. */
  boxMask: number[];
}

/** CellObject represents a Sudoku cell for UI rendering, including position, display values, visibility, read-only status, and borders for 3x3 blocks. */
export interface CellObject {
    /** Unique identifier for the cell. */
    id: string
    /** Linear index of the cell (0-80). */
    index: number
    /** Row index (0-8). */
    row: number
    /** Column index (0-8). */
    column: number
    /** Display value of the cell. */
    value: string
    /** Hidden value for internal logic. */
    hiddenValue: string
    /** Whether the cell value is visible to the user. */
    isVisible: boolean
    /** Whether the cell is read-only (pre-filled). */
    isReadOnly: boolean
    /** Whether the cell has a vertical border. */
    hasVerticalBorder: boolean
    /** Whether the cell has a horizontal border. */
    hasHorizontalBorder: boolean
}