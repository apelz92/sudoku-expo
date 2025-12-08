import { TextInput, View, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";
import { buildSudoku, checkGrid, createStore, gridItem, initGrid, storedGrids } from "../../utils/sudoku";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";
import { ConfettiFireworks } from "../Fireworks";
import InputButtons from "./InputButtons";

/**
 * TODO - generated sudokus should only have unique solutions
 */

export default function Sudoku() {

    const [grid, setGrid] = useState<gridItem[]>(initGrid())
    const [activeDifficulty, setActiveDifficulty] = useState<number | null>(null);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [dragValue, setDragValue] = useState<string | null>(null);
    const [hoveredCell, setHoveredCell] = useState<number | null>(null);
    const [won, hasWon] = useState<boolean>(false)
    const [loaded, componentLoaded] = useState<boolean>(false)
    const refs = Array.from({length: grid.length}, () => useRef<TextInput>(null))
    const { outerBorder, sudokuHeight, sudokuWidth, viewHeight } = useSizes()
    const cellLayouts = useRef<
        { x: number; y: number; width: number; height: number; isReadOnly: boolean }[]
    >([]);

    useEffect(() => {
        if (!loaded) {
            createStore().then()
            componentLoaded(true);
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

    async function difficultyButtonClick(difficulty: number) {
        hasWon(false)
        setActiveCell(null)
        storedGrids[difficulty].map((cell) => {
            cell.isReadOnly = false
            if (cell.isVisible) { cell.value = cell.hiddenValue; cell.isReadOnly = true }
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

    function handleDragMove(globalX: number, globalY: number) {
        let newHover: number | null = null;

        cellLayouts.current.forEach((layout, index) => {
            if (!layout) return;
            const insideX = globalX >= layout.x && globalX <= layout.x + layout.width;
            const insideY = globalY >= layout.y && globalY <= layout.y + layout.height;
            if (insideX && insideY) newHover = index;
        });

        if (newHover !== hoveredCell) setHoveredCell(newHover);
    }

    function handleDropRelease(globalX: number, globalY: number) {
        if (dragValue === null) {
            setHoveredCell(null);
            return;
        }

        let targetIndex: number | null = null;

        cellLayouts.current.forEach((layout, index) => {
            if (!layout) return;
            const insideX = globalX >= layout.x && globalX <= layout.x + layout.width;
            const insideY = globalY >= layout.y && globalY <= layout.y + layout.height;
            if (insideX && insideY) targetIndex = index;
        });

        if (targetIndex !== null && !grid[targetIndex].isReadOnly) {
            updateCell(targetIndex, dragValue);
            setActiveCell(targetIndex)
        }

        setDragValue(null);
        setHoveredCell(null);
    }

    function handleCellHover(index: number | null) {
        setHoveredCell(index);
    }

    function renderSudoku() {
        return (
            <>
                <View
                    key="sudoku"
                    style={[
                        styles.sudoku,
                        {
                            width: sudokuWidth,
                            height: sudokuHeight,
                            borderWidth: outerBorder,
                        },
                    ]}
                >
                    {grid.map((cell: any) => (
                        <Cell
                            {...cell}
                            key={"cell-" + cell.index}
                            id={"cell-" + cell.index}
                            ref={refs[cell.index]}
                            refs={refs}
                            updateValue={updateCell}
                            setActiveCell={setActiveCell}
                            isActive={activeCell === cell.index && cell.isReadOnly === false}
                            isHovered={hoveredCell === cell.index}
                            onHoverIn={() => cell.isReadOnly ? handleCellHover(null) : handleCellHover(cell.index)}
                            onHoverOut={() => handleCellHover(null)}
                            onLayoutCell={(index, layout, isReadOnly) => {
                                cellLayouts.current[index] = {
                                    x: layout.x,
                                    y: layout.y,
                                    width: layout.width,
                                    height: layout.height,
                                    isReadOnly,
                                };
                            }}
                        />
                    ))}
                </View>
            </>
        );
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
                    setActiveDifficulty={setActiveDifficulty}
                    activeDifficulty={activeDifficulty}
                />
                { renderSudoku() }
                <InputButtons
                    activeCell={activeCell}
                    updateCell={updateCell}
                    isReadOnly={(index) => grid[index].isReadOnly}
                    setDragValue={setDragValue}
                    handleDragMove={handleDragMove}
                    handleDropRelease={handleDropRelease}
                />


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