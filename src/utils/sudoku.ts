/**
 * @desc basic sudoku logic that can generate and solve <some> sudokus
 * @todo remove/rewrite deprecated functions
 * @todo add missing doc/comments
 * @todo improve generation of sudoku to have a unique solution
 * @todo expand solve() algorithm to be able to solve every solvable sudoku
 **/

export interface gridItem {
    id: string
    index: number
    row: number
    column: number
    value: string
    hiddenValue: string
    isVisible: boolean
}

/**
 * build sudoku using a difficulty parameter. the higher the difficulty, the less numbers are revealed
 * @param grid
 * @param {number} difficulty sets difficulty between 1-5
 */
export function buildSudoku(grid: gridItem[], difficulty: number): gridItem[] {
    grid = initGrid()
    let solved: boolean = false;
    while (!solved) {
        let numbers = fillGrid();
        let newGrid = grid.map((cell) => {
            const {row, column} = indexToRowColumn(cell.index)
            cell.hiddenValue = String(numbers[row][column])
            cell.value = String(numbers[row][column]) // only for testing
            return cell
        });
        newGrid = makeNumbersVisible(newGrid, difficulty);
        solved = solve(newGrid);
        if (solved) { return newGrid; }
    } return grid;
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
 *
 * @returns {boolean}
 */
/*function hasEmptyInputs() {
    for (let index = 0; index  < inputs.length; index++) {
        if (!(inputs[index].value)) {
            return true;
        }
    } return false;
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
            case 1:
                visibleNumbers = Math.floor((Math.random()) * 3) + 53;
                break;
            case 2:
                visibleNumbers = Math.floor((Math.random()) * 3) + 46;
                break;
            case 3:
                visibleNumbers = Math.floor((Math.random()) * 3) + 39;
                break;
            case 4:
                visibleNumbers = Math.floor((Math.random()) * 3) + 32;
                break;
            case 5:
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
    let numbers = initMatrix();
    while(hasNull(numbers)) {
        initMatrix();
        let fail: number = 0;
        for (let row: number = 0; row < 9; row++) {
            for (let column: number = 0; column < 9; column++) {
                let hasDuplicate: boolean = false;
                let alreadyTried: boolean[] = [];
                randomFill: do {
                    if (fail > 40) {
                        return numbers;
                    }
                    let randomNumber: number = Math.floor(Math.random() * 9 + 1);
                    while (alreadyTried[randomNumber - 1]) {
                        randomNumber = Math.floor(Math.random() * 9 + 1);
                        if (alreadyTried.filter(() => true).length === 9) {
                            for (let clearColumn: number = 0; clearColumn < column + 1; clearColumn++) {
                                numbers[row][clearColumn] = 0;
                            }
                            column = 0;
                            fail++;
                            alreadyTried = [];
                            continue randomFill;
                        }
                    }
                    hasDuplicate = searchSudoku(row, column, randomNumber, numbers);
                    if (hasDuplicate) {
                        alreadyTried[randomNumber - 1] = true;
                    } else {
                        numbers[row][column] = randomNumber;
                    }
                } while (hasDuplicate);
            }
        }
    }
    return numbers;
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
    let hasDuplicate;
    hasDuplicate = searchRow(row, column, number, numbers);
    if(hasDuplicate) { return hasDuplicate; }
    hasDuplicate = searchColumn(row, column, number, numbers);
    if(hasDuplicate) { return hasDuplicate; }
    hasDuplicate = searchBlock(row, column, number, numbers);
    return hasDuplicate;
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
    searchedRow = searchedRow - (searchedRow % 3);
    searchedColumn = searchedColumn - (searchedColumn % 3);
    for (let row = searchedRow; row < searchedRow + 3; row++) {
        for (let column = searchedColumn; column < searchedColumn + 3; column++) {
            if (row === searchedRow && column === searchedColumn) { continue; }
            if (value === numbers[row][column]) {
                return true;
            }
        }
    } return false;
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
 * @param empty
 * @returns {boolean}
 */
function isEmpty(empty: any): boolean {
    return empty === 0;
}

/**
 *
 */
function solve(grid: gridItem[]): boolean {
    //document.getElementById("solve").disabled = true;
    let numbers = writeMatrix(grid);
    let emptyCells = [];
    let emptyCellAmount = 0;
    for (let i = 0; i < numbers.length; i++) {
        emptyCells.push(numbers[i].filter(isEmpty));
        emptyCellAmount += emptyCells[i].length;
    }
    if (emptyCellAmount > 64) { return isNotSolvable(2)}
    let tries = 0;
    while(hasNull(numbers)) {
        for (let row = 0; row < numbers.length; row++) {
            for (let column = 0; column < numbers[row].length; column++) {
                if (numbers[row][column] === 0) {
                    let candidates = findCandidates(row, column, numbers);
                    if (candidates.length === 1) {
                        numbers[row][column] = candidates[0];
                    }
                    if (candidates.length === 0) { return isNotSolvable(1); }
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
function isNotSolvable(condition: number): boolean {
    //result.style.display = "flex";
    switch (condition) {
        case 1: /*result.innerHTML = "Given sudoku board is not solvable";*/ return false;
        case 2: /*result.innerHTML = "Need at least 17 numbers to solve";*/ return false;
        default:  return false;
    }
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
                isVisible: false
            }
        }
    }
    return (
        grid
    );
}

function readGrid(grid: gridItem[]): number[][] {
    let numbers = initMatrix()
    for (let cell of grid) {
        numbers[cell.row][cell.column] = Number(cell.value);
    }
    return numbers;
}

function writeGrid(numbers: number[][]): gridItem[] {
    let grid = initGrid();
    grid.map((cell) => {
        cell.hiddenValue = String(numbers[cell.row][cell.column]);
        return cell;
    })
    return grid;
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