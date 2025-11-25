import {TextInput, View} from "react-native";
import React, {RefObject, useRef, useState} from "react";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";
import {clearGrid, fillGrid, initGrid} from "../../utils/sudoku";

/**
 * TODO - integrate logic from sudoku.ts
 *      - functions for CellProps
 *      - fix state management between difficulty buttons and cells
 */

export default function Sudoku() {
    const [grid, setGrid] = useState(initGrid)
    const refs = Array.from({length: grid.length}, () => useRef<TextInput>(null));

    const useMutationObserver = (
        ref: RefObject<any>,
        callback: MutationCallback,
        options = {
            CharacterData: true,
            childList: true,
            subtree: true,
            attributes: true,
        }
    ) => {
        React.useEffect(() => {
            if (ref.current) {
                const observer = new MutationObserver(callback);
                observer.observe(ref.current, options);
                return () => observer.disconnect();
            }
        }, [ref]);
    };

    const [observed, setObserved] = useState(false)
    refs.map((ref: RefObject<any>) => {
        useMutationObserver(ref, (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes") {
                    if (!observed) {
                        let index: number = 0;
                        if (ref.current) {
                            let currentId = ref.current.id;
                            index = Number(currentId.match(/\d+/gi));
                        }
                        grid[index].value = String(ref.current.value);
                        setObserved(true)
                    }
                }
            }
        })
    })

    function difficultyButtonClick() {
        let numbers: number[][] = fillGrid()
        setGrid(clearGrid)
        for (let cell in grid) {
            grid[cell].value = String(numbers[grid[cell].row][grid[cell].column]);
            setGrid(grid)
            let cellElement = document.getElementById("cell-" + cell);
            cellElement?.setAttribute("value", grid[cell].value)
        }
    }

    /*function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number, id: string) {

    }*/

    function renderSudoku() {
        return (
            <>
                <DifficultyBar onClick={difficultyButtonClick}/>
                <div key="sudoku" className="sudoku">
                    {grid.map((cell: any) => (
                            <div
                                key={cell.index}
                                className={"cell index-" + cell.index + " row-" + cell.row + " col-" + cell.column}>
                                <Cell
                                    {...cell}
                                    grid={grid}
                                    id={"cell-" + cell.index}
                                    ref={refs[cell.index]}
                                    refs={refs}
                                    //onChange={(e: any) => {handleChange(e, cell.index, cell.id)}}
                                />
                            </div>
                        )
                    )}
                </div>
            </>
        )
    }

    return (
        <View>
            {renderSudoku()}
        </View>
    );
}