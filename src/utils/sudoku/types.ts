export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellNum = 0 | SudokuDigit;
export type Board = CellNum[][];

export interface Constraints {
  rowMask: number[];
  colMask: number[];
  boxMask: number[];
}