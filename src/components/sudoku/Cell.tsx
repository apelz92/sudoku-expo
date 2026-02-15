import React, { useEffect, RefObject } from "react";
import type { RefAttributes } from "react";
import { TextInput, Platform } from "react-native";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type CellProps = {
  id: string;
  row: number;
  column: number;
  index: number;
  value: string;
  isReadOnly: boolean;
  hasVerticalBorder: boolean;
  hasHorizontalBorder: boolean;
  inputRef: RefObject<TextInput>; // renamed from ref
  refs: RefObject<TextInput>[];
  updateValue: (index: number, e: any) => void;
  setActiveCell: (index: number | null) => void;
  isActive?: boolean;
  isHovered?: boolean;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  onLayoutCell: (
    index: number,
    layout: { x: number; y: number; width: number; height: number },
    isReadOnly: boolean
  ) => void;
};

type StyledPressableProps = {
  $hasVerticalBorder: boolean;
  $hasHorizontalBorder: boolean;
  $cellSize: number;
  $blockBorders: number;
  $innerBorder: number;
  $backgroundColor: string;
};

const StyledPressable = styled.Pressable<StyledPressableProps>`
  align-items: center;
  justify-content: center;
  border-color: ${COLORS.innerBorderColor};
  position: relative;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-width: ${({ $innerBorder }) => $innerBorder}px;
  width: ${({ $hasVerticalBorder, $cellSize, $blockBorders }) =>
    $hasVerticalBorder ? $cellSize + $blockBorders : $cellSize}px;
  height: ${({ $hasHorizontalBorder, $cellSize, $blockBorders }) =>
    $hasHorizontalBorder ? $cellSize + $blockBorders : $cellSize}px;
  ${({ $hasVerticalBorder, $blockBorders }) =>
    $hasVerticalBorder && `
    border-right-width: ${$blockBorders}px;
    border-right-color: ${COLORS.borderColor};
  `}
  ${({ $hasHorizontalBorder, $blockBorders }) =>
    $hasHorizontalBorder && `
    border-bottom-width: ${$blockBorders}px;
    border-bottom-color: ${COLORS.borderColor};
  `}
`;

type StyledTextInputProps = {
  $hasVerticalBorder: boolean;
  $hasHorizontalBorder: boolean;
  $cellSize: number;
  $blockBorders: number;
  $isReadOnly: boolean;
  $cellFontSize: number;
  $paddingBottom: number;
} & RefAttributes<TextInput>;

const StyledTextInput = styled.TextInput<StyledTextInputProps>`
  align-items: center;
  justify-content: center;
  margin: -1px;
  background-color: transparent;
  position: relative;
  text-align: center;
  color: ${({$isReadOnly}) =>
      $isReadOnly ? COLORS.primaryFontColor : COLORS.secondaryFontColor};
  width: ${({$hasVerticalBorder, $cellSize, $blockBorders}) =>
      $hasVerticalBorder ? $cellSize + $blockBorders : $cellSize}px;
  height: ${({$hasHorizontalBorder, $cellSize, $blockBorders}) =>
      $hasHorizontalBorder ? $cellSize + $blockBorders : $cellSize}px;
  font-size: ${({$cellFontSize}) => $cellFontSize}px;
  padding: 5px 5px ${({$paddingBottom}) => $paddingBottom}px;
`;

export default function Cell({
  isActive,
  isHovered,
  isReadOnly,
  onHoverIn,
  onHoverOut,
  inputRef,
  ...props
}: CellProps) {
  const { innerBorder, blockBorders, cellSize, cellFontSize } = useSizes();

  const paddingBottom = Platform.OS === "android" ? 2 : 8;

  const getCellBackgroundColor = () => {
    if (isActive) return COLORS.cellActive;
    if (isHovered) return COLORS.cellHover;
    if (isReadOnly) return COLORS.cellSecondaryBackground;
    return COLORS.cellPrimaryBackground;
  };

  const measureAndReport = () => {
    const target = inputRef?.current;
    if (!target || typeof target.measureInWindow !== "function") return;
    try {
      target.measureInWindow((x, y, width, height) => {
        props.onLayoutCell(props.index, { x, y, width, height }, isReadOnly);
      });
    } catch (err) {}
  };

  useEffect(() => {
    const t = setTimeout(() => measureAndReport(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <StyledPressable
      onLayout={() => {
        setTimeout(() => measureAndReport(), 0);
      }}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPress={() => inputRef.current?.focus()}
      $hasVerticalBorder={props.hasVerticalBorder}
      $hasHorizontalBorder={props.hasHorizontalBorder}
      $cellSize={cellSize}
      $blockBorders={blockBorders}
      $innerBorder={innerBorder}
      $backgroundColor={getCellBackgroundColor()}
    >
      <StyledTextInput
        id={props.id}
        editable={!isReadOnly}
        value={props.value}
        ref={inputRef}
        onFocus={() => props.setActiveCell(props.index)}
        onBlur={() => props.setActiveCell(null)}
        inputMode={"numeric"}
        caretHidden={true}
        cursorColor={"rgba(0,0,0,0)"}
        onKeyPress={(e) => {
          const key = (e.nativeEvent as any).key;
          if (!isReadOnly && /[1-9]/.test(key)) {
            inputRef.current?.clear();
            props.updateValue(props.index, key);
          } else if (!isReadOnly && (key === "Delete" || key === "Backspace")) {
            props.updateValue(props.index, "");
          }
        }}
        $hasVerticalBorder={props.hasVerticalBorder}
        $hasHorizontalBorder={props.hasHorizontalBorder}
        $cellSize={cellSize}
        $blockBorders={blockBorders}
        $isReadOnly={isReadOnly}
        $cellFontSize={cellFontSize}
        $paddingBottom={paddingBottom}
        selectionColor={"rgba(0,0,0,0)"}
      />
    </StyledPressable>
  );
}
