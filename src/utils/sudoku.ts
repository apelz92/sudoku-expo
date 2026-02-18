/**
 * @desc basic sudoku logic that can generate and solve <some> sudokus
 * TODO remove/rewrite deprecated functions
 *      add missing doc/comments
 *      improve generation of sudoku to have a unique solution
 *      expand solve() algorithm to be able to solve every solvable sudoku
 *      improve difficulty assessment -> analyze complexity of a sudoku
 *      instead of just removing an arbitrary amount numbers
 **/

const now: () => number = typeof performance !== 'undefined' && typeof performance.now === 'function'
  ? performance.now.bind(performance)
  : Date.now;

// Precomputed bit-to-number table: bitToNum[1<<k] = k+1 for k=0..8
const bitToNum = new Uint8Array(512);
for (let k = 0; k < 9; k++) bitToNum[1 << k] = k + 1;

export interface CellObject {
    id: string
    index: number
    row: number
    column: number
    value: string
    hiddenValue: string
    isVisible: boolean
    isReadOnly: boolean
    hasVerticalBorder: boolean
    hasHorizontalBorder: boolean
}
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

function pickBetter(
    current: { puzzle: number[][]; solution: number[][]; assessment: ReturnType<typeof assessDifficulty>; clues: number },
    candidate: { puzzle: number[][]; solution: number[][]; assessment: ReturnType<typeof assessDifficulty>; clues: number },
    requestedDifficulty: number,
    range: { min: number; max: number }
): typeof current {
    const currentDiff = Math.abs(current.assessment.difficulty - requestedDifficulty);
    const candidateDiff = Math.abs(candidate.assessment.difficulty - requestedDifficulty);

    if (candidateDiff < currentDiff) {
        return candidate;
    } else if (candidateDiff > currentDiff) {
        return current;
    } else {
        // Tie: prefer closeness to range midpoint
        const midpoint = (range.min + range.max) / 2;
        const currentCloseness = Math.abs(current.clues - midpoint);
        const candidateCloseness = Math.abs(candidate.clues - midpoint);
        return candidateCloseness < currentCloseness ? candidate : current;
    }
}

const EASY_MAX_CLUES = 60;
const HARD_MIN_CLUES = 20;
const CLUES_STEP = (EASY_MAX_CLUES - HARD_MIN_CLUES) / 4;
const MAX_CLUES_BY_DIFFICULTY = [60, 55, 50, 35, 25];

const CLUE_RANGES_BY_DIFFICULTY = [
  { min: 55, max: 65 },
  { min: 45, max: 55 },
  { min: 35, max: 45 },
  { min: 25, max: 35 },
  { min: 17, max: 25 },
] as const;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Build a Sudoku puzzle with a desired difficulty (0-4).
 * Generates a full solved board, then removes numbers while guaranteeing a unique solution.
 * The difficulty determines the target number of visible clues and is verified by complexity analysis.
 * @param difficulty - integer between 0 (easiest) and 4 (hardest)
 * @returns Array of Cell representing the puzzle
 */
export function buildSudoku(difficulty: number): { grid: CellObject[]; timings: BuildTimings } {
    // Normalize difficulty to integer in [0, 4]
    if (Number.isNaN(difficulty)) {
        difficulty = 0;
    }
    difficulty = Math.round(difficulty);
    difficulty = Math.max(0, Math.min(4, difficulty));
    const _timings: BuildTimings = { fillGrid: 0, removeCells: 0, assess: 0 };

    const range = CLUE_RANGES_BY_DIFFICULTY[difficulty];
    let best: { puzzle: number[][]; solution: number[][]; assessment: ReturnType<typeof assessDifficulty>; clues: number } | null = null;

    for (let loop = 0; loop < 10; loop++) {
        const targetClues = randInt(range.min, range.max);

        // Generate a valid solved board (timed)
        const fillStart = now();
        let solution = fillGrid();
        while (!isValidBoard(solution)) {
            solution = fillGrid();
        }
        _timings.fillGrid += now() - fillStart;

        // Remove cells for unique puzzle (timed)
        const removeStart = now();
        const puzzle = removeCellsForUnique(solution, targetClues);
        _timings.removeCells += now() - removeStart;

        // Compute clues
        let clues = 0;
        for (const row of puzzle) clues += row.filter(cell => cell !== 0).length;

        // Hard gate: reject if not in range
        if (clues < range.min || clues > range.max) {
            continue;
        }

        // Assess difficulty
        const assessStart = now();
        const assessment = assessDifficulty(puzzle);
        _timings.assess += now() - assessStart;

        if (__DEV__ && SUDOKU_VERBOSE) {
            console.log("[sudoku] buildSudoku:loop", { loop, difficulty, targetClues, clues, assessed: assessment });
        }

        // Keep best candidate
        if (!best) {
            best = { puzzle, solution, assessment, clues };
        } else {
            best = pickBetter(best, { puzzle, solution, assessment, clues }, difficulty, range);
        }

        // Early exit on exact assessed difficulty match
        if (assessment.difficulty === difficulty) {
            break;
        }
    }

    // If no candidate, fallback
    if (!best) {
        throw new Error("Failed to generate sudoku");
    }

    if (__DEV__ && SUDOKU_VERBOSE) {
        console.log("[sudoku] buildSudoku:selected", { assessment: best.assessment, clues: best.clues, _timings });
    }

    // Convert puzzle matrix to UI grid items
    const grid = initGrid().map((cell) => {
        const { row, column } = indexToRowColumn(cell.index);
        const val = best.puzzle[row][column];
        const solVal = best.solution[row][column];
        cell.hiddenValue = String(solVal);
        cell.value = val !== 0 ? String(val) : "";
        cell.isVisible = val !== 0;
        cell.isReadOnly = val !== 0;
        return cell;
    });
    return { grid, timings: _timings };
}

export function buildSudokuGrid(difficulty: number): CellObject[] {
    return buildSudoku(difficulty).grid;
}


/**
 * Creates a 9×9 matrix filled with zeros.
 *
 * @returns {number[][]} A zero‑filled 9x9 matrix.
 */
function initMatrix(): number[][] {
    return [
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0]
    ];
}

/**
 * Checks if the grid is solved by verifying that each cell's visible value matches its hidden solution value.
 * @param grid - Array of Cell objects representing the Sudoku grid
 * @returns true if all visible cells match their hidden values, false otherwise
 */
export function checkGrid(grid: CellObject[]): boolean {
    for (let cell of grid) {
        if (!cell.hiddenValue) {
            return false;
        }
        if (cell.value !== cell.hiddenValue) {
            return false;
        }
    } return true;
}



/**
 * Generates a valid, solved Sudoku board using a randomized pattern-based approach.
 * Creates a base pattern, shuffles rows/columns within bands/stacks, and applies digit permutation.
 * @returns A 9x9 number[][] representing a complete, valid Sudoku solution
 */
export function fillGrid(): number[][] {
    const pattern = (r: number, c: number) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
    const base: number[][] = [];
    for (let r = 0; r < 9; r++) {
        base[r] = [];
        for (let c = 0; c < 9; c++) {
            base[r][c] = pattern(r, c);
        }
    }
    const shuffle = (arr: any[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };
    const rows = Array.from({ length: 9 }, (_, i) => i);
    for (let band = 0; band < 3; band++) {
        const bandRows = rows.slice(band * 3, band * 3 + 3);
        shuffle(bandRows);
        for (let i = 0; i < 3; i++) {
            rows[band * 3 + i] = bandRows[i];
        }
    }
    const cols = Array.from({ length: 9 }, (_, i) => i);
    for (let stack = 0; stack < 3; stack++) {
        const stackCols = cols.slice(stack * 3, stack * 3 + 3);
        shuffle(stackCols);
        for (let i = 0; i < 3; i++) {
            cols[stack * 3 + i] = stackCols[i];
        }
    }
    const board: number[][] = [];
    for (let r = 0; r < 9; r++) {
        board[r] = [];
        for (let c = 0; c < 9; c++) {
            board[r][c] = base[rows[r]][cols[c]];
        }
    }
    const digits = [1,2,3,4,5,6,7,8,9];
    shuffle(digits);
    const map: {[key:number]: number} = {};
    for (let i = 0; i < 9; i++) map[i + 1] = digits[i];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            board[r][c] = map[board[r][c]];
        }
    }
    return board;
}

/**
 * Counts the number of solutions for a given board.
 *
 * @param {number[][]} board - The Sudoku board to evaluate.
 * @param {number} [maxCount=2] - Maximum number of solutions to count before early exit.
 * @returns {number} The total number of distinct solutions found (up to `maxCount`).
 */
function countSolutions(board: number[][], maxCount: number = 2): number {
    return fastCountSolutions(board, maxCount);
}

/**
 * Removes cells from a solved board while ensuring a unique solution.
 *
 * @param {number[][]} solvedBoard - A fully solved Sudoku board.
 * @param {number} targetClues - Desired number of clues (filled cells) to retain.
 * @returns {number[][]} A puzzle board with cells removed, guaranteed to have a single solution.
 *
 * @remarks
 * This function shuffles all cell indices, then attempts to remove each cell
 * in that random order. After each removal it checks that the board still has
 * exactly one solution via `countSolutions`. If uniqueness is lost, the removal
 * is reverted. This “shuffle‑then‑try‑remove” strategy helps produce varied puzzles.
 */
function removeCellsForUnique(solvedBoard: number[][], targetClues: number): number[][] {
    const puzzle = solvedBoard.map(row => [...row]);
    let clues = 81;
    const maxAttempts = 81 * 20;
    let attempts = 0;

    while (clues > targetClues && attempts < maxAttempts) {
        const indices = Array.from({ length: 81 }, (_, i) => i);
        // Shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        let removedThisPass = 0;
        for (const idx of indices) {
            if (clues <= targetClues) break;
            if (attempts >= maxAttempts) break;
            attempts++;
            const { row, column } = indexToRowColumn(idx);
            const temp = puzzle[row][column];
            if (temp === 0) continue; // Already empty
            puzzle[row][column] = 0;
            if (countSolutions(puzzle) !== 1) {
                puzzle[row][column] = temp; // revert
            } else {
                clues--;
                removedThisPass++;
            }
        }
        if (removedThisPass === 0) {
            break; // cannot remove further
        }
    }
    return puzzle;
}

/**
 * Assesses the difficulty of a puzzle using multiple complexity signals.
 *
 * @param {number[][]} puzzle - The Sudoku puzzle board to evaluate.
 * @returns {{ difficulty: number; backtracks: number; maxDepth: number; nakedSingles: number; clues: number }}
 *   An object containing the difficulty rating (0‑4), backtrack count, maximum recursion depth, count of naked singles, and number of visible clues.
 *
 * @remarks
 * The solver tracks:
 *   - Backtracks (traditional metric)
 *   - Maximum recursion depth reached during solving
 *   - Number of naked singles encountered (cells with only one possible candidate)
 *   - Number of visible clues (non-zero cells)
 * These signals are combined into a weighted score to derive a difficulty level.
 */
export function assessDifficulty(puzzle: number[][]): { difficulty: number; backtracks: number; maxDepth: number; nakedSingles: number; clues: number } {
    let backtracks = 0;
    let maxDepth = 0;
    let currentDepth = 0;
    let nakedSingles = 0;
    const boardCopy = puzzle.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    const solveWithCount = (): boolean => {
        const cell = findMRVCell(boardCopy, rowMask, colMask, boxMask);
        if (!cell) return true;
        const { row, col, candidates } = cell;
        if (candidates === 0) return false;
        if (bitCount(candidates) === 1) nakedSingles++;
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        let cands = candidates;
        try {
            while (cands) {
                const bit = cands & -cands;
                cands &= cands - 1;
                const num = bitToNum[bit];
                boardCopy[row][col] = num;
                rowMask[row] |= bit;
                colMask[col] |= bit;
                boxMask[boxIdx] |= bit;
                if (solveWithCount()) return true;
                boardCopy[row][col] = 0;
                rowMask[row] &= ~bit;
                colMask[col] &= ~bit;
                boxMask[boxIdx] &= ~bit;
                backtracks++;
            }
            return false;
        } finally {
            currentDepth--;
        }
    };

    solveWithCount();

    let clues = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (puzzle[r][c] !== 0) clues++;
        }
    }

    // Weighted score combining signals
    const score = backtracks + (maxDepth - 10) * 2.0 - nakedSingles * 0.5 + (81 - clues) * 1.5;
    let difficulty = 0;
    if (score > 300) difficulty = 4;
    else if (score > 100) difficulty = 3;
    else if (score > 40) difficulty = 2;
    else if (score > 10) difficulty = 1;

    return { difficulty, backtracks, maxDepth, nakedSingles, clues };
}

/**
 * Initializes bitmask constraint arrays from a board
 * Each mask is a 9-bit number where bit i (0-indexed) = 1 means digit (i+1) is used.
 * @returns Object with rowMask[9], colMask[9], boxMask[9] arrays
 */
function initConstraints(board: number[][]): { rowMask: number[], colMask: number[], boxMask: number[] } {
    const rowMask = new Array(9).fill(0);
    const colMask = new Array(9).fill(0);
    const boxMask = new Array(9).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = board[r][c];
            if (val !== 0) {
                const bit = 1 << (val - 1);
                rowMask[r] |= bit;
                colMask[c] |= bit;
                boxMask[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= bit;
            }
        }
    }
    return { rowMask, colMask, boxMask };
}

/**
 * Returns the bitmask of candidate digits for cell (r, c).
 * A set bit means that digit is available (not used in row/col/box).
 */
function getCandidates(r: number, c: number, rowMask: number[], colMask: number[], boxMask: number[]): number {
    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    return (~(rowMask[r] | colMask[c] | boxMask[boxIdx])) & 0x1FF;
}

/** Counts the number of set bits in a 9-bit mask. */
function bitCount(mask: number): number {
    let count = 0;
    let m = mask;
    while (m) {
        count++;
        m &= m - 1;
    }
    return count;
}

/**
 * Finds the empty cell with the Minimum Remaining Values (fewest candidates).
 * Returns null if no empty cells exist (board is solved).
 * Returns the cell coordinates and its candidate bitmask.
 */
function findMRVCell(board: number[][], rowMask: number[], colMask: number[], boxMask: number[]): { row: number, col: number, candidates: number } | null {
    let bestRow = -1, bestCol = -1, bestCount = 10, bestCandidates = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                const cands = getCandidates(r, c, rowMask, colMask, boxMask);
                const count = bitCount(cands);
                if (count === 0) return { row: r, col: c, candidates: 0 }; // dead end
                if (count < bestCount) {
                    bestCount = count;
                    bestRow = r;
                    bestCol = c;
                    bestCandidates = cands;
                    if (count === 1) break;
                }
            }
        }
        if (bestCount === 1) break;
    }
    if (bestRow === -1) return null;
    return { row: bestRow, col: bestCol, candidates: bestCandidates };
}

/**
 * Counts solutions for a board using bitmask constraints and MRV.
 * Stops early once maxCount solutions are found.
 * @param board - 9x9 number[][] (will NOT be modified — works on a copy)
 * @param maxCount - stop counting once this many solutions found (default 2)
 * @returns number of solutions found (up to maxCount)
 */
function fastCountSolutions(board: number[][], maxCount: number = 2): number {
    const boardCopy = board.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    let count = 0;
    const backtrack = (): boolean => {
        const cell = findMRVCell(boardCopy, rowMask, colMask, boxMask);
        if (!cell) { count++; return count >= maxCount; }
        const { row, col, candidates } = cell;
        if (candidates === 0) return false;
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        let cands = candidates;
        while (cands) {
            const bit = cands & -cands;
            cands &= cands - 1;
            const num = bitToNum[bit];
            boardCopy[row][col] = num;
            rowMask[row] |= bit;
            colMask[col] |= bit;
            boxMask[boxIdx] |= bit;
            if (backtrack()) return true;
            boardCopy[row][col] = 0;
            rowMask[row] &= ~bit;
            colMask[col] &= ~bit;
            boxMask[boxIdx] &= ~bit;
        }
        return false;
    };
    backtrack();
    return count;
}

/**
 * Solves a board using bitmask constraints and MRV.
 * Returns a solved copy of the board, or null if unsolvable.
 */
function fastSolve(board: number[][]): number[][] | null {
    const boardCopy = board.map(row => [...row]);
    const { rowMask, colMask, boxMask } = initConstraints(boardCopy);
    const backtrack = (): boolean => {
        const cell = findMRVCell(boardCopy, rowMask, colMask, boxMask);
        if (!cell) return true;
        const { row, col, candidates } = cell;
        if (candidates === 0) return false;
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        let cands = candidates;
        while (cands) {
            const bit = cands & -cands;
            cands &= cands - 1;
            const num = bitToNum[bit];
            boardCopy[row][col] = num;
            rowMask[row] |= bit;
            colMask[col] |= bit;
            boxMask[boxIdx] |= bit;
            if (backtrack()) return true;
            boardCopy[row][col] = 0;
            rowMask[row] &= ~bit;
            colMask[col] &= ~bit;
            boxMask[boxIdx] &= ~bit;
        }
        return false;
    };
    return backtrack() ? boardCopy : null;
}


function isValidGroup(values: number[]): boolean {
    const seen = new Set<number>();
    for (const val of values) {
        if (val < 1 || val > 9 || seen.has(val)) return false;
        seen.add(val);
    }
    return true;
}

/**
 * Checks a group of values for duplicate non-zero entries.
 * Zeros (empty cells) are skipped. Non-zero values must be in 1‑9 range with no duplicates.
 * @param values - Array of numbers to check
 * @returns true if no duplicates among non-zero values and all non-zero values are 1‑9
 */
function isValidPartialGroup(values: number[]): boolean {
    const seen = new Set<number>();
    for (const val of values) {
        if (val === 0) continue; // skip empty
        if (val < 1 || val > 9 || seen.has(val)) return false;
        seen.add(val);
    }
    return true;
}

/**
 * Validates that a fully solved Sudoku board follows all rules:
 * every row, column, and 3×3 block contains exactly the digits 1‑9 with no duplicates.
 * Empty cells (value 0) cause validation to fail — use isValidPuzzle() for partial boards.
 * @param numbers - 9x9 number[][] board to validate (must be fully filled)
 * @returns true if the board is a valid complete solution, false otherwise
 */
export function isValidBoard(numbers: number[][]): boolean {
    for (let i = 0; i < 9; i++) {
        // Row i
        if (!isValidGroup(numbers[i])) return false;
        // Column i
        if (!isValidGroup(numbers.map(row => row[i]))) return false;
    }
    // 3×3 blocks
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const block: number[] = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    block.push(numbers[r][c]);
                }
            }
            if (!isValidGroup(block)) return false;
        }
    }
    return true;
}

/**
 * Validates that a partial Sudoku board (puzzle) has no rule violations.
 * Empty cells (value 0) are ignored. Checks that no filled value (1-9) appears
 * twice in any row, column, or 3x3 block.
 * @param numbers - 9x9 number[][] board to validate (may contain zeros for empty cells)
 * @returns true if no rules are violated among filled cells, false otherwise
 */
export function isValidPuzzle(numbers: number[][]): boolean {
    for (let i = 0; i < 9; i++) {
        if (!isValidPartialGroup(numbers[i])) return false;
        if (!isValidPartialGroup(numbers.map(row => row[i]))) return false;
    }
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const block: number[] = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    block.push(numbers[r][c]);
                }
            }
            if (!isValidPartialGroup(block)) return false;
        }
    }
    return true;
}

/**
 * Solves the provided grid and returns a solved copy.
 * The original grid is left untouched.
 * @param grid - Puzzle state to solve
 * @returns Solved grid cells with all numbers populated and read-only
 */
export function solve(grid: CellObject[]): CellObject[] {
    const board = writeMatrix(grid);
    const solved = fastSolve(board);
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
    return (
        grid
    );
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
 * Converts a linear array of {@link CellObject}s into a 9×9 numeric matrix.
 *
 * @param {CellObject[]} grid - The Sudoku grid as an array of cell objects.
 * @returns {number[][]} A 9×9 matrix where each entry is the numeric value of the
 * corresponding cell (empty strings are treated as `0`).
 *
 * @remarks
 * Iterates over the grid in row‑major order, filling the matrix row by row.
 */
function writeMatrix(grid: CellObject[]): number[][] {
    let readNumbers = initMatrix();
    let row = 0;
    let column = 0;
    for (let cell of grid) {
        readNumbers[row][column] = Number(cell.value);
        column++;
        if (column > 8) {
            column = 0;
            row++;
        }
        if (row > 8) {
            return readNumbers;
        }
    } return readNumbers;
}
