import type { Board, CellNum, CellObject } from './types';

/**
 * Parses string value to CellNum (0-9).
 *
 * Empty string -> 0, single digit 1-9 -> number, else 0.
 *
 * @param value - String to parse.
 * @returns `CellNum` - 0 or 1-9.
 *
 * @example
 * parseCellValue('5'); // 5
 * parseCellValue(''); // 0
 * parseCellValue('10'); // 0
 */
export function parseCellValue(value: string): CellNum {
  if (value === '') return 0;
  if (/^[1-9]$/.test(value)) return Number(value) as CellNum;
  return 0;
}

/**
 * Converts CellObject[] to Board.
 *
 * Maps each cell's value via parseCellValue to board[r][c].
 *
 * @param cells - 81 CellObjects.
 * @returns `Board` - Numeric board.
 *
 * @example
 * const board = cellsToBoard(grid);
 * console.log(board[0][0]); // 0 or 1-9
 */
export function cellsToBoard(cells: CellObject[]): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(0) as CellNum[]);
  for (const cell of cells) {
    const r = cell.row;
    const c = cell.column;
    board[r][c] = parseCellValue(cell.value);
  }
  return board;
}

/**
 * Converts Board puzzle and solution to CellObject[].
 *
 * Creates 81 cells with value from puzzle, hiddenValue from solution, visible/readonly if val !== 0, borders for 3x3.
 *
 * @param puzzle - Puzzle Board.
 * @param solution - Solution Board.
 * @returns `CellObject[]` - 81 cells.
 *
 * @example
 * const grid = boardToCells(puzzle, solution);
 * console.log(grid[0].isVisible); // true if puzzle[0][0] !== 0
 */
export function boardToCells(puzzle: Board, solution: Board): CellObject[] {
  const grid: CellObject[] = [];
  for (let row = 0; row < 9; row++) {
    for (let column = 0; column < 9; column++) {
      const index = row * 9 + column;
      const val = puzzle[row][column];
      const solVal = solution[row][column];
      const cell: CellObject = {
        id: "cell-" + index,
        index,
        row,
        column,
        value: val !== 0 ? String(val) : "",
        hiddenValue: String(solVal),
        isVisible: val !== 0,
        isReadOnly: val !== 0,
        hasVerticalBorder: column === 2 || column === 5,
        hasHorizontalBorder: row === 2 || row === 5,
      };
      grid.push(cell);
    }
  }
  return grid;
}

/**
 * Converts a linear index (0-80) to row/column coordinates.
 * @param index - Linear index from 0 to 80
 * @returns Object with row (0-8) and column (0-8) properties
 */
export function indexToRowColumn(index: number): { row: number; column: number } {
    return { row: index / 9 | 0, column: index % 9 };
}

/**
 * Converts row/column coordinates to a linear index (0-80).
 * @param row - Row number (0-8)
 * @param column - Column number (0-8)
 * @returns Linear index from 0 to 80
 */
export function rowColumnToIndex(row: number, column: number): number {
    return row * 9 + column;
}

/**
 * Initializes an empty Sudoku grid with 81 Cell objects, setting borders for 3x3 blocks.
 * @returns Array of 81 Cell objects with default properties (all hidden, not visible, not readonly)
 */
export function initGrid(): CellObject[] {
    const grid: CellObject[] = []
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            const index = rowColumnToIndex(row, column)
            grid[index] = {
                id: "cell-" + index,
                index: index,
                row: row,
                column: column,
                value: "",
                hiddenValue: "",
                isVisible: false,
                isReadOnly: false,
                hasVerticalBorder: false,
                hasHorizontalBorder: false,
            }
            if (column === 2 || column === 5) {
                grid[index].hasVerticalBorder = true;
            }
            if (row === 2 || row === 5) {
                grid[index].hasHorizontalBorder = true;
            }
        }
    }
    return grid;
}