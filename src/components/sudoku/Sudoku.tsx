/**
 * @fileoverview Main Sudoku game component that manages the overall game state, rendering, and user interactions.
 * This component handles puzzle generation, difficulty selection, cell updates, drag-and-drop input,
 * win detection, and integrates with various sub-components for the complete Sudoku experience.
 */

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

let SUDOKU_UI_VERBOSE = true;

/**
 * Enables or disables verbose logging for the Sudoku UI component in development mode.
 * @param v - Boolean flag to enable (true) or disable (false) verbose logging.
 */
export function setSudokuUIVerbose(v: boolean) { SUDOKU_UI_VERBOSE = v; }

/**
 * @typedef {Object} StyledBaseViewProps
 * @property {$height} number - The height of the base view in pixels.
 * @property {$width} number - The width of the base view in pixels.
 */
type StyledBaseViewProps = {
  $height: number;
  $width: number;
};

/**
 * @const {StyledComponent} StyledBaseView - A styled View component that serves as the base container for the Sudoku game layout.
 * It is configured with column flex direction, centered justification, and dynamic height and width based on props.
 */
const StyledBaseView = styled.View<StyledBaseViewProps>`
  flex-direction: column;
  justify-content: center;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`;

/**
 * @typedef {Object} StyledSudokuViewProps
 * @property {$width} number - The width of the Sudoku grid view in pixels.
 * @property {$height} number - The height of the Sudoku grid view in pixels.
 * @property {$borderWidth} number - The width of the border around the Sudoku grid in pixels.
 */
type StyledSudokuViewProps = {
  $width: number;
  $height: number;
  $borderWidth: number;
};

/**
 * @const {StyledComponent} StyledSudokuView - A styled View component that renders the 9x9 Sudoku grid layout.
 * It uses flexbox for wrapping cells into rows, with centered alignment and a border background.
 */
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
 * @const {number[]} DIFFICULTY_LEVELS - Array of difficulty level indices (0-4) used for generating Sudoku puzzles.
 * Each index corresponds to a difficulty from easiest (0) to hardest (4).
 */
const DIFFICULTY_LEVELS = [0, 1, 2, 3, 4];

/**
 * TODO **IMPORTANT**
 *      - flesh out hints/pencil marks
 *      - make difficulty selection responsive to assessment metadata (dynamic target clues)
 *      - use asynchronous local storage to save boards between browser refreshes
 *      **VISUAL**
 *      - highlight rows/columns and numbers of active cell
 *      - use lens when dragging buttons (accessibility feature for mobile)
 *      **OPTIONAL**
 *      - add timer + progress tracking
 *      - add undo/redo buttons
 *      - expose settings menu (theme, sound, solver hints, etc.)
 *      - save a history to enable user to go back to previously generated boards
 */

/**
 * Main Sudoku game component that renders the complete Sudoku interface including the grid, difficulty selector, input buttons, and win celebration.
 * Manages game state such as current puzzle, active cell, drag-and-drop interactions, and win detection.
 * @returns {JSX.Element} The rendered Sudoku game interface.
 */
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

  /**
   * Handles difficulty button clicks by loading or generating a new puzzle for the selected difficulty level.
   * Resets game state, updates the grid with the new puzzle, and prepares a fresh puzzle for future use.
   * @param difficulty - The difficulty level index (0-4) for the new puzzle.
   */
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
    setTimeout(() => {
      const updated = [...storedGrids];
      updated[difficulty] = buildSudoku(difficulty).grid;
      setStoredGrids(updated);
    }, 0);
  }

  /**
   * Updates the value of a specific cell in the Sudoku grid and triggers a re-render.
   * @param index - The index of the cell to update (0-80).
   * @param newValue - The new value to set for the cell (string representation of a digit or empty).
   */
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

  /**
   * Handles drag move events during drag-and-drop input by determining which cell is being hovered over.
   * Updates the hovered cell state for visual feedback during dragging.
   * @param globalX - The global X coordinate of the drag position.
   * @param globalY - The global Y coordinate of the drag position.
   */
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

  /**
   * Handles the release of a drag-and-drop operation by determining the target cell and updating it with the dragged value.
   * Only updates editable cells and sets the active cell to the target.
   * @param globalX - The global X coordinate where the drop occurred.
   * @param globalY - The global Y coordinate where the drop occurred.
   */
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

  /**
   * Updates the hovered cell state for visual feedback during interactions.
   * @param index - The index of the cell being hovered (0-80) or null if no cell is hovered.
   */
  function handleCellHover(index: number | null) {
    setHoveredCell(index);
  }

  /**
   * Automatically solves the current Sudoku puzzle and updates the grid with the solution.
   * Clears the active cell selection after solving.
   */
  const handleAutoSolve = useCallback(() => {
    const solvedGrid = solve(grid);
    setGrid(solvedGrid);
    setActiveCell(null);
  }, [grid]);

  /**
   * Renders the 9x9 Sudoku grid by mapping over the grid cells and creating Cell components.
   * Each cell is passed props for interaction, styling, and layout measurement.
   * @returns {JSX.Element} The rendered Sudoku grid view.
   */
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
