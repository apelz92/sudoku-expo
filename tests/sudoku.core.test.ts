import { describe, it, expect } from 'vitest';
import { isValidPuzzle, isValidBoard, fastSolve, fastCountSolutions, assessDifficulty } from '../src/utils/sudoku';
import { parseCellValue } from '../src/utils/sudoku/uiAdapter';

describe('Sudoku Core Tests', () => {
  describe('isValidPuzzle and isValidBoard', () => {
    it('should return true for valid partial puzzle', () => {
      const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ];
      expect(isValidPuzzle(puzzle)).toBe(true);
    });

    it('should return false for invalid puzzle with duplicate in row', () => {
      const puzzle = [
        [5,3,5,0,7,0,0,0,0], // duplicate 5 in row
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ];
      expect(isValidPuzzle(puzzle)).toBe(false);
    });

    it('should return true for valid solved board', () => {
      const solved = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ];
      expect(isValidBoard(solved)).toBe(true);
    });
  });

  describe('fastSolve', () => {
    it('should solve a known puzzle', () => {
      const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ];
      const solved = fastSolve(puzzle);
      expect(solved).not.toBeNull();
      expect(isValidBoard(solved!)).toBe(true);
    });
  });

  describe('fastCountSolutions', () => {
    it('should return 1 for unique puzzle', () => {
      const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
      ];
      expect(fastCountSolutions(puzzle, 2)).toBe(1);
    });

    it('should return >1 for underconstrained puzzle (empty grid)', () => {
      const empty = Array(9).fill(Array(9).fill(0));
      expect(fastCountSolutions(empty, 2)).toBeGreaterThan(1);
    });
  });

  describe('parseCellValue', () => {
    it('should parse valid digits', () => {
      expect(parseCellValue('1')).toBe(1);
      expect(parseCellValue('9')).toBe(9);
    });

    it('should return 0 for invalid inputs', () => {
      expect(parseCellValue('')).toBe(0);
      expect(parseCellValue('0')).toBe(0);
      expect(parseCellValue('10')).toBe(0);
      expect(parseCellValue('a')).toBe(0);
      expect(parseCellValue('1.5')).toBe(0);
    });
  });

  describe('assessDifficulty', () => {
    it('should assess easy puzzle correctly', () => {
      const easyPuzzle = [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9]
      ];
      const assessment = assessDifficulty(easyPuzzle);
      expect(assessment.difficulty).toBeLessThanOrEqual(1);
      expect(assessment.clues).toBe(81);
    });

    it('should handle empty puzzle', () => {
      const empty = Array(9).fill(Array(9).fill(0));
      const assessment = assessDifficulty(empty);
      expect(assessment.difficulty).toBeDefined();
      expect(assessment.clues).toBe(0);
    });
  });
});