import {TextInput, View} from "react-native";
import React, {useRef, useState} from "react";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";

type SudokuProps = {
    row: number
    column: number
    index: number
    value: number
    difficulty: number
    grid: Object[]
}

export default function Sudoku(props: SudokuProps) {
    const puzzle = initBoard()
    const [grid, setGrid] = useState(props.grid)
    const refs = Array.from({ length: puzzle.length }, () => useRef<TextInput>(null));

    function onCreate() {
        return (
            <>
                <DifficultyBar difficulty={props.difficulty}/>
                <div key="sudoku" className="sudoku">
                    {puzzle.map((cell: any) => (
                            <div key={cell.index}
                                 className={"cell cell" + cell.index + " row" + cell.row + " col" + cell.column}>
                                <Cell {...cell} grid={puzzle} id={"cell" + cell.index} refs={refs} />
                            </div>
                        )
                    )}
                </div>
            </>
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
                    value: ""
                }
                index++;
            }
        }
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