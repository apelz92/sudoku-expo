import { TextInput, View, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";
import { buildSudoku, checkGrid, createStore, gridItem, initGrid, storedGrids } from "../../utils/sudoku";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";
import { ConfettiFireworks } from "../Fireworks";

/**
 * TODO - implement general mobile functionality
 *      - add a row of number buttons for easier use on mobile devices
 *      - generated sudokus should only have unique solutions
 */

export default function Sudoku() {

    const [grid, setGrid] = useState<gridItem[]>(initGrid())
    const [activeDifficulty, setActiveDifficulty] = useState<number | null>(null);
    const [won, hasWon] = useState<boolean>(false)
    const [loaded, componentloaded] = useState<boolean>(false)
    const refs = Array.from({length: grid.length}, () => useRef<TextInput>(null))
    const { outerBorder, sudokuHeight, sudokuWidth, viewHeight } = useSizes()

    useEffect(() => {
        if (!loaded) {
            createStore().then()
            componentloaded(true);
        }
    }, [loaded])

    useEffect(() => {
        if (won) {
            const updatedGrid = grid.map((cell) => ({
                ...cell,
                isReadOnly: true,
            }));
            setGrid(updatedGrid);
            setActiveDifficulty(null);
        }
    }, [won]);

    useEffect(() => {
        if (loaded) {
            hasWon(checkGrid(grid))
        }
    }, [grid])

/*    function inputsReadOnly(isReadOnly: boolean) {
        const updatedGrid = grid.map((cell) => {
            cell.isReadOnly = isReadOnly
            return cell
        });
        setGrid(updatedGrid);
    }*/

    function updateActiveDifficulty(difficulty: number | null) {
        setActiveDifficulty(difficulty)
    }

    async function difficultyButtonClick(difficulty: number) {
        hasWon(false)
        storedGrids[difficulty].map((cell) => {
            cell.isReadOnly = false
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
                <View key="sudoku"
                      style={[
                          styles.sudoku,
                          {
                              width: sudokuWidth,
                              height: sudokuHeight,
                              borderWidth: outerBorder,
                          }]}
                >
                    {grid.map((cell: any) => (
                        <Cell {...cell}
                              key={"cell-" + cell.index}
                              id={"cell-" + cell.index}
                              ref={refs[cell.index]}
                              refs={refs}
                              updateValue={updateCell}
                              checkGrid={checkGrid(grid)}
                              styles={styles}
                        />
                        )
                    )}
                </View>
            </>
        )
    }

    return (
            <View style={[
                styles.base,
                {
                    height: viewHeight,
                    width: sudokuWidth,
                }]}
            >
                <DifficultyBar
                    onClick={difficultyButtonClick}
                    updateActiveDifficulty={updateActiveDifficulty}
                    activeDifficulty={activeDifficulty}
                />
                { renderSudoku() }
                <ConfettiFireworks trigger={won}></ConfettiFireworks>
            </View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "column",
        justifyContent: "center",
    },
    sudoku: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        borderColor: COLORS.borderColor,
        backgroundColor: COLORS.borderColor,
        userSelect: "none",
    },
});