/**
 * @desc basic sudoku script that can generate and solve <some> sudokus
 * * @class sudoku
 * @todo remove/rewrite deprecated functions
 * @todo add missing doc/comments
 * @todo improve generation of sudoku to have a unique solution
 * @todo expand solve() algorithm to be able to solve every solvable sudoku
 * @todo expand the class with OOP
 **/

let numbers: number[][]

interface gridItem {
    index: number
    row: number
    column: number
    value: string
    hiddenValue: string
    isVisible: boolean
}

let emptyInputs = true

/**
 * build sudoku using a difficulty parameter. the higher the difficulty, the less numbers are revealed
 * @param grid
 * @param {number} difficulty sets difficulty between 1-5
 */
function buildSudoku(grid: gridItem[], difficulty: number) {
    clear();
    let solved: boolean = false;
    while (!solved) {
        clear();
        fillGrid();
        hideNumbers(difficulty);
        solved = solve();
    }
}

function clear() {
    numbers = [
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

export function clearGrid(grid: gridItem[]): gridItem[] {
    grid = initGrid();
    return grid;
}

/**
 * iterate over the board matrix to check if values of the input fields are identical to the values of the matrix
 */
/*function checkSudoku() {
    let correct = true;*/
    /** if there are still empty input fields, do not compare values unless the highlight slider is enabled */
    /*if(!emptyInputs || highlightNumbers.checked) {
        for(let row = 0; row < numbers.length; row++) {
            for(let column = 0; column < numbers[row].length; column++) {*/
                /** get value of input fields by using Element ID ("sudo" + indexes+1) */
                /*let elementID = "sudo" + (row+1) + (column+1);
                let inputElement = document.getElementById(elementID);
                let inputValue = Number(inputElement.value);
                let number = numbers[row][column];

                if (inputValue !== number && inputValue && highlightNumbers.checked) {
                    inputElement.style.color = "rgb(255, 0, 0)";
                }

                if (inputValue !== number) {
                    correct = false;
                }
                else {
                    inputElement.style.color = "rgb(0, 0, 0)";
                }
            }
        }*/
        /** text shown on result display */
        /*if(!emptyInputs) {
            let resultMessage;
            if (correct) {
                resultMessage = "You win!"
            } else {
                resultMessage = "There are some errors in your solution."
            }
            result.style.display = "flex";
            result.innerHTML = resultMessage;
        }
    }
}*/

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
        checkSudoku();
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
 * @param {number} difficulty sets difficulty between 1-5
 */
function hideNumbers(difficulty: number) {
    let deletedNumbers;
    let empty: boolean = hasEmpty();
    if(!empty) {
        switch (difficulty) {
            case 1:
                deletedNumbers = Math.floor((Math.random()) * 10) + 30;
                break;
            case 2:
                deletedNumbers = Math.floor((Math.random()) * 10) + 40;
                break;
            case 3:
                deletedNumbers = Math.floor((Math.random()) * 5) + 50;
                break;
            case 4:
                deletedNumbers = Math.floor((Math.random()) * 5) + 55;
                break;
            case 5:
                deletedNumbers = Math.floor((Math.random()) * 5) + 60;
                break;
            default:
                deletedNumbers = 0;
                break;
        }
        for (let i = 0; i < deletedNumbers; i++) {
            let index = Math.floor((Math.random()) * 81);
            if (!(inputs[index].value)) {
                i--;
            } else {
                inputs[index].value = "";
            }
        }
    }
}

/**
 * - brute force method of generating a sudoku board
 * - there are probably more efficients methods
 * - with these parameters, generation of a board takes ~1 ms
 * @returns {*} recursion when the max amount of tries is reached
 */
export function fillGrid(): number[][] {
    clear();
    let fail: number = 0;
    for(let row: number = 0; row < 9; row++) {
        for(let column: number = 0; column < 9; column++) {
            let hasDuplicate: boolean = false;
            let alreadyTried: boolean[] = [];
            randomFill: do {
                if(fail > 40) {
                    return numbers;
                }
                let randNum: number = Math.floor(Math.random() * 9 + 1);
                while(alreadyTried[randNum-1]) {
                    randNum = Math.floor(Math.random() * 9 + 1);
                    if(alreadyTried.filter(() => true).length === 9) {
                        for (let clearColumn: number = 0; clearColumn < column+1; clearColumn++) {
                            numbers[row][clearColumn] = 0;
                        }
                        column = 0;
                        fail++;
                        alreadyTried = [];
                        continue randomFill;
                    }
                }
                hasDuplicate = searchSudoku(row, column, randNum);
                if(hasDuplicate) {
                    alreadyTried[randNum-1] = true;
                } else {
                    numbers[row][column] = randNum;
                }
            } while(hasDuplicate);
        }
    }
    return numbers;
}

/**
 * searches the board for duplicates
 * @param i line
 * @param j column
 * @param number number to be searched for duplicates
 * @returns {boolean} true - if duplicate has been found
 */
function searchSudoku(i, j, number) {
    let hasDuplicate;
    hasDuplicate = searchRow(i, j, number);
    if(hasDuplicate) { return hasDuplicate; }
    hasDuplicate = searchColumn(i, j, number);
    if(hasDuplicate) { return hasDuplicate; }
    hasDuplicate = searchBlock(i, j, number);
    return hasDuplicate;
}

/**
 *
 * @param hasDuplicate
 * @returns {boolean}
 */
/*function isCandidate(hasDuplicate) {
    if (hasDuplicate) { return false; }
    if (!hasDuplicate) { return true; }
}*/

/**
 *
 * @param i
 * @param j
 * @param value
 * @returns {boolean}
 */
function searchRow(i: number, j: number, value: number) {
    for (let m = 0; m < 9; m++) {
        if (m === i) { continue; }
        if (value === numbers[m][j]) {
            return true;
        }
    } return false;
}

/**
 *
 * @param i
 * @param j
 * @param value
 * @returns {boolean}
 */
function searchColumn(i: number, j: number, value: number): boolean {
    for (let n = 0; n < 9; n++) {
        if (n === j) { continue; }
        if (value === numbers[i][n]) {
            return true;
        }
    } return false;
}

/**
 *
 * @param i
 * @param j
 * @param value
 * @returns {boolean}
 */
function searchBlock(i: number, j: number, value: number): boolean {
    let m = i - (i % 3);
    let n = j - (j % 3);
    for (let k = m; k < m + 3; k++) {
        for (let l = n; l < n + 3; l++) {
            if (k === i && l === j) { continue; }
            if (value === numbers[k][l]) {
                return true;
            }
        }
    } return false;
}

/**
 * checks for empty values in the input elements
 * @returns {boolean} true - if there are empty elements
 */
function hasEmpty(): boolean {
    for(let row in numbers) {
        for(let column in numbers[row]) {
            if (numbers[row][column] === 0) {
                return true;
            }
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
function solve() {
    //document.getElementById("solve").disabled = true;
    numbers = readSudoku();
    let emptyCells = [];
    let emptyCellAmount = 0;
    for (let i = 0; i < numbers.length; i++) {
        emptyCells.push(numbers[i].filter(isEmpty));
        emptyCellAmount += emptyCells[i].length;
    }
    if (emptyCellAmount > 64) { return isNotSolvable(2)}
    let tries = 0;
    while(hasEmpty()) {
        for (let row = 0; row < numbers.length; row++) {
            for (let column = 0; column < numbers[row].length; column++) {
                if (numbers[row][column] === 0) {
                    let candidates = findCandidates(row, column);
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
/*function isNotSolvable(condition) {
    result.style.display = "flex";
    switch (condition) {
        case 1: result.innerHTML = "Given sudoku board is not solvable"; return false;
        case 2: result.innerHTML = "Need at least 17 numbers to solve"; return false;
    }
}*/

/**
 *
 */
/*function findCandidates(grid: gridItem) {
    let candidates = [];
    for (let number = 1; number <= 9; number++) {
        if ((isCandidate(searchSudoku(row, column, number)))) {
            candidates.push(number);
        }
    } return candidates;
}*/

export function initGrid(): gridItem[] {
    const outputGrid: gridItem[] = []
    let index = 0;
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            outputGrid[index] = {
                index: index,
                row: row,
                column: column,
                value: ""
            }
            index++;
        }
    }
    return (
        outputGrid
    );
}

function readGrid(inputGrid: gridItem[]) {
    for (let cell of inputGrid) {
        numbers[cell.row][cell.column] = Number(cell.value);
    }
}

function writeGrid(): gridItem[] {
    let outputGrid: gridItem[] = initGrid();
    for (let cell of outputGrid) {
        cell.value = String(numbers[cell.row][cell.column]);
    }
    return outputGrid;
}

/**
 *
 */
/* function readSudoku(grid: gridItem[]) {
    clear();
    let row = 0;
    let column = 0;
    for (let index in grid) {
        numbers[row][column] = Number(inputs[index].value);
        column++;
        if (column > 8) {
            column = 0;
            row++;
        }
        if (row > 8) {
            return numbers;
        }
    } return numbers;
} */