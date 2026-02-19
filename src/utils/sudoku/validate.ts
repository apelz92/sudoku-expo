import { Board } from './types';

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
            const val = board[r][c];
            if (val !== 0) {
                const bit = 1 << (val - 1);
                if (seenMask & bit) return false;
                seenMask |= bit;
            }
        }
    }

    // Columns (no allocations)
    for (let c = 0; c < 9; c++) {
        let seenMask = 0;
        for (let r = 0; r < 9; r++) {
            const val = board[r][c];
            if (val !== 0) {
                const bit = 1 << (val - 1);
                if (seenMask & bit) return false;
                seenMask |= bit;
            }
        }
    }

    // Blocks (no allocations)
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let seenMask = 0;
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    const val = board[r][c];
                    if (val !== 0) {
                        const bit = 1 << (val - 1);
                        if (seenMask & bit) return false;
                        seenMask |= bit;
                    }
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
            const val = board[r][c];
            const bit = 1 << (val - 1);
            if (seenMask & bit) return false;
            seenMask |= bit;
        }
        if (seenMask !== 0x1FF) return false; // Ensure all 1-9 present
    }

    // Columns
    for (let c = 0; c < 9; c++) {
        let seenMask = 0;
        for (let r = 0; r < 9; r++) {
            const val = board[r][c];
            const bit = 1 << (val - 1);
            if (seenMask & bit) return false;
            seenMask |= bit;
        }
        if (seenMask !== 0x1FF) return false;
    }

    // Blocks
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let seenMask = 0;
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    const val = board[r][c];
                    const bit = 1 << (val - 1);
                    if (seenMask & bit) return false;
                    seenMask |= bit;
                }
            }
            if (seenMask !== 0x1FF) return false;
        }
    }

    return true;
}