/**
 * @desc basic sudoku logic that can generate and solve <some> sudokus
 * TODO remove/rewrite deprecated functions
 *      add missing doc/comments
 *      improve generation of sudoku to have a unique solution
 *      expand solve() algorithm to be able to solve every solvable sudoku
 **/

export interface gridItem {
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

export let storedGrids: gridItem[][] = new Array(5)

/**
 * build sudoku using a difficulty parameter. the higher the difficulty, the less numbers are revealed
 * @param {number} difficulty sets difficulty between 1-5
 */
export async function buildSudoku(difficulty: number): Promise<gridItem[]> {
    let solved: boolean = false;
    while (!solved) {
        let numbers = fillGrid();
        if (!isValidBoard(numbers)) {
            continue;
        }
        let newGrid = initGrid().map((cell) => {
            const {row, column} = indexToRowColumn(cell.index)
            cell.hiddenValue = String(numbers[row][column])
            cell.value = String(numbers[row][column]) // only for testing
            return cell
        });
        newGrid = makeNumbersVisible(newGrid, difficulty);
        solved = solve(newGrid);
        if (solved) { return newGrid; }
    } return initGrid();
}

export async function createStore() {
    for (let difficulty = 0; difficulty < storedGrids.length; difficulty++) {
        storedGrids[difficulty] = await buildSudoku(difficulty)
    }
}

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
 * iterate over the board matrix to check if values of the input fields are identical to the values of the matrix
 */
export function checkGrid(grid: gridItem[]) {
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
 * reveal a random cell, if it's not empty. retry until empty cell to reveal is found
 */
/*function cheat() {
    emptyInputs = hasEmptyInputs();
    if(emptyInputs) {
        let cheated = false;
        while(!cheated) {
            let index = Math.floor((Math.random()) * 81);
            if (!(inputs[index].value)) {
                let input = inputs[index].getAttribute("id");
                // transform id string into indexes
                input = input.slice(-2);
                let i = Math.floor((input / 10) - 1);
                let j = (input % 10) - 1;
                inputs[index].value = numbers[i][j];
                cheated = true;
            }
        }
        emptyInputs = hasEmptyInputs();
    }
    if(!emptyInputs) {
        checkGrid();
    }
}*/

/**
 * - hide values of random cells determined by difficulty
 * - (only visible text in input fields is hidden. values in the matrix are still saved)
 * @param grid
 * @param {number} difficulty sets difficulty between 1-5
 */
function makeNumbersVisible(grid: gridItem[], difficulty: number): gridItem[] {
    let visibleNumbers: number = 0;
    let gridHasVisible: boolean = hasVisible(grid)
    if(!gridHasVisible) {
        switch (difficulty) {
            case 0:
                visibleNumbers = Math.floor((Math.random()) * 3) + 53;
                break;
            case 1:
                visibleNumbers = Math.floor((Math.random()) * 3) + 46;
                break;
            case 2:
                visibleNumbers = Math.floor((Math.random()) * 3) + 39;
                break;
            case 3:
                visibleNumbers = Math.floor((Math.random()) * 3) + 32;
                break;
            case 4:
                visibleNumbers = Math.floor((Math.random()) * 3) + 25;
                break;
        }
        for (let madeVisible = 0; madeVisible < visibleNumbers; madeVisible++) {
            let index = Math.floor((Math.random()) * 81);
            if (grid[index].isVisible) {
                madeVisible--;
            } else {
                grid[index].isVisible = true;
            }
        }
    }
    return grid;
}

/**
 * - brute force method of generating a sudoku board
 * - there are probably more efficients methods
 * - with these parameters, generation of a board takes ~1 ms
 * @returns
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
 * searches the board for duplicates
 * @param row line
 * @param column column
 * @param number number to be searched for duplicates
 * @param numbers
 * @returns {boolean} true - if duplicate has been found
 */
function searchSudoku(row: number, column: number, number: number, numbers: number[][]): boolean {
    // Check for duplicates in row, column, then 3x3 block, logging the source of any duplicate
    let hasDuplicate = searchRow(row, column, number, numbers);
    if (hasDuplicate) {
        console.log(`Duplicate ${number} found in row ${row}`);
        return true;
    }
    hasDuplicate = searchColumn(row, column, number, numbers);
    if (hasDuplicate) {
        console.log(`Duplicate ${number} found in column ${column}`);
        return true;
    }
    hasDuplicate = searchBlock(row, column, number, numbers);
    if (hasDuplicate) {
        console.log(`Duplicate ${number} found in block for cell (${row},${column})`);
        return true;
    }
    return false;
}

export function isValidBoard(numbers: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
        const seen = new Set<number>();
        for (let c = 0; c < 9; c++) {
            const val = numbers[r][c];
            if (val < 1 || val > 9 || seen.has(val)) return false;
            seen.add(val);
        }
    }
    for (let c = 0; c < 9; c++) {
        const seen = new Set<number>();
        for (let r = 0; r < 9; r++) {
            const val = numbers[r][c];
            if (val < 1 || val > 9 || seen.has(val)) return false;
            seen.add(val);
        }
    }
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const seen = new Set<number>();
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    const val = numbers[r][c];
                    if (val < 1 || val > 9 || seen.has(val)) return false;
                    seen.add(val);
                }
            }
        }
    }
    return true;
}

/**
 *
 * @param hasDuplicate
 * @returns {boolean}
 */
function isCandidate(hasDuplicate: boolean): boolean {
    if (hasDuplicate) { return false; }
    if (!hasDuplicate) { return true; }
    return hasDuplicate;
}

/**
 *
 * @param searchedRow
 * @param column
 * @param value
 * @param numbers
 * @returns {boolean}
 */
function searchRow(searchedRow: number, column: number, value: number, numbers: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
        if (row === searchedRow) { continue; }
        if (value === numbers[row][column]) {
            return true;
        }
    } return false;
}

/**
 *
 * @param row
 * @param searchedColumn
 * @param value
 * @param numbers
 * @returns {boolean}
 */
function searchColumn(row: number, searchedColumn: number, value: number, numbers: number[][]): boolean {
    for (let column = 0; column < 9; column++) {
        if (column === searchedColumn) { continue; }
        if (value === numbers[row][column]) {
            return true;
        }
    } return false;
}

/**
 *
 * @param searchedRow
 * @param searchedColumn
 * @param value
 * @param numbers
 * @returns {boolean}
 */
function searchBlock(searchedRow: number, searchedColumn: number, value: number, numbers: number[][]): boolean {
  const origRow = searchedRow;
  const origCol = searchedColumn;
  const startRow = origRow - (origRow % 3);
  const startCol = origCol - (origCol % 3);
  for (let row = startRow; row < startRow + 3; row++) {
    for (let col = startCol; col < startCol + 3; col++) {
      if (row === origRow && col === origCol) { continue; }
      if (value === numbers[row][col]) {
        console.log(`Duplicate ${value} found in block at (${row},${col})`);
        return true;
      }
    }
  }
  return false;
}

/**
 * checks for empty values in the input elements
 * @returns {boolean} true - if there are empty elements
 */
function hasNull(numbers: number[][]): boolean {
    for (let row in numbers) {
        for (let column in numbers[row]) {
            if (numbers[row][column] === 0) {
                return true;
            }
        }
    }
    return false;
}

function hasVisible(grid: gridItem[]): boolean {
    for (let cell of grid) {
        if (cell.isVisible) {
            return true;
        }
    }
    return false;
}

/**
 *
 */
function solve(grid: gridItem[]): boolean {
    let numbers = writeMatrix(grid);
    let emptyCells = [];
    let emptyCellAmount = 0;
    for (let i = 0; i < numbers.length; i++) {
        emptyCells.push(numbers[i].filter((empty: any) => {return empty === 0}));
        emptyCellAmount += emptyCells[i].length;
    }
    if (emptyCellAmount > 64) { return false }
    let tries = 0;
    while(hasNull(numbers)) {
        for (let row = 0; row < numbers.length; row++) {
            for (let column = 0; column < numbers[row].length; column++) {
                if (numbers[row][column] === 0) {
                    let candidates = findCandidates(row, column, numbers);
                    if (candidates.length === 1) {
                        numbers[row][column] = candidates[0];
                    }
                    if (candidates.length === 0) { return false; }
                }
            }
        }
        tries++;
        if (tries > 20) { return false; }
    } return true;
}

/**
 *
 */
function findCandidates(row: number, column: number, numbers: number[][]) {
    let candidates: number[] = [];
    for (let number = 1; number <= 9; number++) {
        if ((isCandidate(searchSudoku(row, column, number, numbers)))) {
            candidates.push(number);
        }
    } return candidates;
}

export function initGrid(): gridItem[] {
    const grid: gridItem[] = []
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

export function indexToRowColumn(index: number) {
    return { row: index / 9 | 0, column: index % 9 };
}

export function rowColumnToIndex(row: number, column: number) {
    return row * 9 + column;
}

/**
 *
 */
function writeMatrix(grid: gridItem[]) {
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