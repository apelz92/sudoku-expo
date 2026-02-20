/**
 * @fileoverview Provides input buttons for the Sudoku game, including draggable number buttons and a solve button.
 * This component renders a row of buttons for numbers 1-9, a clear button, and optionally a solve button.
 * Buttons support both tapping and dragging interactions for inputting values into the Sudoku grid.
 */

import React from "react";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";
import DraggableButton from "./DraggableButton";

/** Props for the StyledNumberRow component, defining layout properties. */
type StyledNumberRowProps = {
  $marginTop: number;
  $height: number;
};

/** Styled View component for arranging input buttons in a horizontal row with responsive margins and height. */
const StyledNumberRow = styled.View<StyledNumberRowProps>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: ${({ $marginTop }) => $marginTop}px;
  height: ${({ $height }) => $height}px;
`;

/** Styled TouchableOpacity component for the solve button, sized relative to cell dimensions. */
const StyledSolveButton = styled.TouchableOpacity<{ cellSize: number }>`
  border-radius: 6px;
  background-color: ${COLORS.primary};
  border-width: 2px;
  border-color: ${COLORS.primary};
  justify-content: center;
  align-items: center;
  padding-bottom: 3px;
  width: ${({ cellSize }) => Math.floor(cellSize * 1.6)}px;
  height: ${({ cellSize }) => cellSize}px;
  margin: ${({ cellSize }) => Math.floor(cellSize / 10)}px;
`;

/** Styled Text component for the solve button label, with responsive font sizing. */
const StyledSolveText = styled.Text<{ fontSize: number }>`
  color: ${COLORS.primaryFontColor};
  font-weight: 700;
  font-size: ${({ fontSize }) => fontSize}px;
`;

/** Props for the InputButtons component, defining callbacks and state for input interactions. */
type InputButtonProps = {
  activeCell: number | null;
  updateCell: (index: number, value: string) => void;
  isReadOnly: (index: number) => boolean;
  setDragValue: (v: string | null) => void;
  handleDragMove: (x: number, y: number) => void;
  handleDropRelease: (x: number, y: number) => void;
  onSolve?: () => void;
};

/**
 * React component that renders a row of input buttons for Sudoku, including numbers 1-9, clear, and optionally solve.
 * Buttons support both tapping and dragging for inputting values into the active cell.
 * @param activeCell - Index of the currently active cell, or null if none.
 * @param updateCell - Function to update a cell's value at a given index.
 * @param isReadOnly - Function to check if a cell at a given index is read-only.
 * @param setDragValue - Function to set the value being dragged.
 * @param handleDragMove - Function to handle drag movement with coordinates.
 * @param handleDropRelease - Function to handle drag end with coordinates.
 * @param onSolve - Optional function to trigger solving the puzzle.
 * @returns JSX element containing the input buttons row.
 */
export default function InputButtons({
                                       activeCell,
                                       updateCell,
                                       isReadOnly,
                                       setDragValue,
                                       handleDragMove,
                                       handleDropRelease,
                                       onSolve,
                                     }: InputButtonProps) {
  const { cellSize } = useSizes();

  /** Handles tapping on an input button, updating the active cell if it's not read-only. */
  const handleTap = (value: string) => {
    if (activeCell !== null && !isReadOnly(activeCell)) {
      updateCell(activeCell, value);
    }
  };

  return (
      <StyledNumberRow
          key="InputButtons"
          $marginTop={Math.floor(cellSize / 10)}
          $height={Math.floor(cellSize * 2.5)}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <DraggableButton
                key={num}
                value={String(num)}
                onTap={() => handleTap(String(num))}
                onDragStart={() => setDragValue(String(num))}
                onDragMove={handleDragMove}
                onDragEnd={handleDropRelease}
            />
        ))}
        <DraggableButton
            value="clear"
            label="Clear"
            dragLabel="Clr"
            onTap={() => handleTap("")}
            onDragStart={() => setDragValue("")}
            onDragMove={handleDragMove}
            onDragEnd={handleDropRelease}
            styleOverride={{
              backgroundColor: COLORS.borderColor,
              borderColor: COLORS.borderColor,
              borderWidth: 2,
            }}
        />
        {onSolve && (
            <StyledSolveButton cellSize={cellSize} onPress={onSolve}>
              <StyledSolveText fontSize={Math.floor((Math.floor(cellSize * 1.6)) / 3)}>
                Solve
              </StyledSolveText>
            </StyledSolveButton>
        )}
      </StyledNumberRow>
  );
}