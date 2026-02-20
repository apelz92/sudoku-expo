import { TextInput } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import Cell from "./Cell";
import DifficultyBar from "./DifficultyBar";
import { buildSudoku, CellObject, initGrid, cellsToBoard, isValidBoard, solve } from "../../utils/sudoku";
import { useSizes } from "./ResponsiveDesign";
import { ConfettiFireworks } from "../Fireworks";
import InputButtons from "./InputButtons";

let SUDOKU_UI_VERBOSE = false;
export function setSudokuUIVerbose(v: boolean) { SUDOKU_UI_VERBOSE = v; }

type StyledBaseViewProps = {
  $height: number;
  $width: number;
};

const StyledBaseView = styled.View<StyledBaseViewProps>`
  flex-direction: column;
  justify-content: center;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`;

type StyledSudokuViewProps = {
  $width: number;
  $height: number;
  $borderWidth: number;
};

const StyledSudokuView = styled.View<StyledSudokuViewProps>`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  border-color: ${COLORS.borderColor};
  background-color: ${COLORS.borderColor};
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-width: ${({ $borderWidth }) => $borderWidth}px;
`;

/**
 * TODO *functional*
 *      - make difficulty selection responsive to assessment metadata (dynamic target clues)
 *      - add timer + progress tracking with difficulty history
 *      - flesh out hints/pencil marks while keeping solve() available as helper
 *      - add undo/redo stack for user inputs
 *      - expose settings menu (theme, sound, solver hints, etc.)
 */

const DIFFICULTY_LEVELS = [0, 1, 2, 3, 4];

export default function Sudoku() {
  const [grid, setGrid] = useState<CellObject[]>(initGrid());
  const [storedGrids, setStoredGrids] = useState<CellObject[][]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [won, hasWon] = useState<boolean>(false);
  const [loaded, componentLoaded] = useState<boolean>(false);
  const refs: React.RefObject<TextInput>[] = Array.from({ length: 81 }, () => useRef<TextInput>(null)) as React.RefObject<TextInput>[];
  const { outerBorder, sudokuHeight, sudokuWidth, viewHeight } = useSizes();
  const cellLayouts = useRef<
      { x: number; y: number; width: number; height: number; isReadOnly: boolean }[]
    >([]);

  useEffect(() => {
    if (storedGrids.length === 0) {
      let cancelled = false;
      const puzzles: CellObject[][] = [];
      const generateNext = (index: number) => {
        if (cancelled || index >= DIFFICULTY_LEVELS.length) {
          if (!cancelled && puzzles.length === DIFFICULTY_LEVELS.length) {
            setStoredGrids(puzzles);
          }
          return;
        }
        puzzles.push(buildSudoku(DIFFICULTY_LEVELS[index]).grid);
        setTimeout(() => generateNext(index + 1), 0);
      };
      generateNext(0);
      return () => { cancelled = true; };
    }
  }, [storedGrids.length]);

  useEffect(() => {
    if (!loaded) {
      componentLoaded(true);
    }
  }, [loaded]);

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
      hasWon(isValidBoard(cellsToBoard(grid)));
    }
  }, [grid]);

  async function difficultyButtonClick(difficulty: number) {
    if (__DEV__ && SUDOKU_UI_VERBOSE) {
      console.log("[Sudoku] difficultyButtonClick", {
        difficulty,
        storedGridsLength: storedGrids.length,
        hasGridAtDifficulty: !!storedGrids[difficulty],
        firstCell: storedGrids[difficulty]?.[0],
      });
    }
    hasWon(false);
    setActiveCell(null);
    const newGrid = storedGrids[difficulty]
      .map((cell: CellObject) => ({ ...cell }))
      .map((cell: CellObject) => {
        cell.isReadOnly = cell.isVisible;
        cell.value = cell.isVisible ? cell.hiddenValue! : "";
        return cell;
      });
    setGrid(newGrid);
    // Regenerate replacement puzzle in background
    setTimeout(() => {
      const updated = [...storedGrids];
      updated[difficulty] = buildSudoku(difficulty).grid;
      setStoredGrids(updated);
    }, 0);
  }

  function updateCell(index: number, newValue: string) {
    if (__DEV__ && SUDOKU_UI_VERBOSE) {
      console.log("[Sudoku] updateCell", {
        index,
        newValue,
        prev: grid[index],
      });
    }
    const updatedGrid = grid.map((cell) => {
      if (index === cell.index) {
        return { ...cell, value: newValue };
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
      if (insideX && insideY && !grid[index].isReadOnly) newHover = index;
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
      setActiveCell(targetIndex);
    }

    setDragValue(null);
    setHoveredCell(null);
  }

  function handleCellHover(index: number | null) {
    setHoveredCell(index);
  }

  const handleAutoSolve = useCallback(() => {
    const solvedGrid = solve(grid);
    setGrid(solvedGrid);
    setActiveCell(null);
  }, [grid]);

  function renderSudoku() {
    return (
        <StyledSudokuView
            key="sudoku"
            $width={sudokuWidth}
            $height={sudokuHeight}
            $borderWidth={outerBorder}
        >
          {grid.map((cell) => (
              <Cell
                  {...cell}
                  key={"cell-" + cell.index}
                  id={"cell-" + cell.index}
                  inputRef={refs[cell.index]}
                  refs={refs}
                  updateValue={updateCell}
                  setActiveCell={setActiveCell}
                  isActive={activeCell === cell.index && !cell.isReadOnly}
                  isHovered={hoveredCell === cell.index}
                  onHoverIn={() => (cell.isReadOnly ? handleCellHover(null) : handleCellHover(cell.index))}
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
        </StyledSudokuView>
    );
  }

  return (
      <StyledBaseView $height={viewHeight} $width={sudokuWidth}>
          <DifficultyBar
              onClick={difficultyButtonClick}
              setActiveDifficulty={setActiveDifficulty}
              activeDifficulty={activeDifficulty}
          />
          {renderSudoku()}
          <InputButtons
              activeCell={activeCell}
              updateCell={updateCell}
              isReadOnly={(index) => grid[index].isReadOnly}
              setDragValue={setDragValue}
              handleDragMove={handleDragMove}
              handleDropRelease={handleDropRelease}
              onSolve={handleAutoSolve}
          />
          <ConfettiFireworks trigger={won} />
      </StyledBaseView>
  );
}
