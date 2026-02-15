import React from "react";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";
import DraggableButton from "./DraggableButton";

type StyledNumberRowProps = {
  $marginTop: number;
  $height: number;
};

const StyledNumberRow = styled.View<StyledNumberRowProps>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: ${({ $marginTop }) => $marginTop}px;
  height: ${({ $height }) => $height}px;
`;

type InputButtonProps = {
  activeCell: number | null;
  updateCell: (index: number, value: string) => void;
  isReadOnly: (index: number) => boolean;
  setDragValue: (v: string | null) => void;
  handleDragMove: (x: number, y: number) => void;
  handleDropRelease: (x: number, y: number) => void;
};

export default function InputButtons({
  activeCell,
  updateCell,
  isReadOnly,
  setDragValue,
  handleDragMove,
  handleDropRelease,
}: InputButtonProps) {
  const { cellSize } = useSizes();

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
    </StyledNumberRow>
  );
}
