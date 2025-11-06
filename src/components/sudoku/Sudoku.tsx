import {View} from "react-native";
import React from "react";
import Cell from "./Cell";

type SudokuProps = {
    row: number
    column: number
    index: number
    value: number
    grid: Object[]
}

export default function Sudoku(props: SudokuProps) {

    const puzzle = initBoard()

    function onCreate() {
        return (
            <div key="sudoku" className="sudoku">
                {puzzle.map((cell: any) => (
                    <div key={cell.index} className={"cell cell"+cell.index+" row"+cell.row+" col"+cell.column}>
                        <Cell {...cell} />
                    </div>
                    )
                )}
            </div>
        )
    }

    function initBoard(): Object[] {
        const cells: Object[] = []
        let index = 0;
        for (let row = 0; row < 9; row++) {
            for (let column = 0; column < 9; column++) {
                cells[index] = {
                    index: index,
                    row: row,
                    column: column,
                    value: "0"
                }
                index++;
            }
        }
        console.log(cells);
        return (
            cells
        );
    }

    return (
        <View>
            { onCreate() }
        </View>
    );
}