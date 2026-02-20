import type { Board, CellNum, CellObject } from './types';

/**
 * Parses a string value into a valid CellNum (0-9).
 * @param value - The string to parse.
 * @returns The parsed CellNum, or 0 if invalid.
 */
export function parseCellValue(value: string): CellNum {
  if (value === '') return 0;
  if (/^[1-9]$/.test(value)) return Number(value) as CellNum;
  return 0;
}

/**
 * Converts an array of CellObject to a Board.
 * @param cells - The array of cell objects.
 * @returns The corresponding Board.
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
 * Converts a puzzle board and solution board to an array of CellObject for UI.
 * @param puzzle - The puzzle board.
 * @param solution - The solution board.
 * @returns An array of CellObject.
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
 * Converts a linear cell index to row and column.
 * @param index - The linear index (0-80).
 * @returns An object with row and column.
 */
export function indexToRowColumn(index: number): { row: number; column: number } {
    return { row: index / 9 | 0, column: index % 9 };
}

/**
 * Converts row and column to a linear cell index.
 * @param row - Row index.
 * @param column - Column index.
 * @returns The linear index (0-80).
 */
export function rowColumnToIndex(row: number, column: number): number {
    return row * 9 + column;
}

/**
 * Initializes an empty grid of CellObject for the UI.
 * @returns An array of 81 empty CellObject.
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
