import {TextInput, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";
import {buildSudoku, checkGrid, createStore, initGrid, storedGrids} from "../../utils/sudoku";

/**
 *
 */

export default function Sudoku() {

    const [grid, setGrid] = useState(initGrid())
    const [won, hasWon] = useState<boolean>(false)
    const [loaded, componentLoaded] = useState(false)
    const refs = Array.from({length: grid.length}, () => useRef<TextInput>(null))

    useEffect(() => {
        if (!loaded) {
            createStore().then()
            componentLoaded(true);
        }
    })

    function onCellChange() {
        hasWon(checkGrid(grid))
        console.log("won? ", won)
    }

    async function difficultyButtonClick(difficulty: number) {
        storedGrids[difficulty].map((cell) => {
            if (cell.isVisible) cell.value = cell.hiddenValue
            else if (!cell.isVisible) cell.value = ""
            return cell
        });
        setGrid(storedGrids[difficulty])
        storedGrids[difficulty] = await buildSudoku(difficulty);
    }

    function updateCell(index: number, newValue: string) {
        const updatedGrid = grid.map((cell) => {
            if (index === cell.index) {
                return { ...cell, value: newValue, isVisible: true }
            }
            return cell;
        });
        setGrid(updatedGrid);
    }

    function renderSudoku() {
        return (
            <>

                <div key="sudoku" className="sudoku">
                    {grid.map((cell: any) => (
                            <div
                                key={cell.index}
                                className={"cell index-" + cell.index + " row-" + cell.row + " col-" + cell.column}>
                                <Cell
                                    {...cell}
                                    id={"cell-" + cell.index}
                                    ref={refs[cell.index]}
                                    updateValue={updateCell}
                                    checkGrid={checkGrid(grid)}
                                    onChangeText={onCellChange}
                                />
                            </div>
                        )
                    )}
                </div>

            </>
        )
    }

    if (won) {
        return (
            <View>
                <DifficultyBar onClick={difficultyButtonClick}/>
                <div key="won" className={"win-border"}>
                    {renderSudoku()}
                </div>
            </View>
        );
    } else {
        return (
            <View>
                <DifficultyBar onClick={difficultyButtonClick}/>
                {renderSudoku()}
            </View>
        );
    }
}