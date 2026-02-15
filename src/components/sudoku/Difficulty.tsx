import React, { useState } from "react";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type StyledPressableProps = {
  $backgroundColor: keyof typeof COLORS;
  $height: number;
  $width: number;
  $marginRight: number;
};

const StyledPressable = styled.Pressable<StyledPressableProps>`
  align-items: center;
  justify-content: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 3px;
  background-color: ${({ $backgroundColor }) => COLORS[$backgroundColor]};
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
  margin-right: ${({ $marginRight }) => $marginRight}px;
`;

type StyledTextProps = {
  $fontSize: number;
};

const StyledText = styled.Text<StyledTextProps>`
  text-align: center;
  font-family: system-ui;
  font-weight: 700;
  color: ${COLORS.primaryFontColor};
  font-size: ${({ $fontSize }) => $fontSize}px;
`;

type DifficultyProps = {
  difficulty: number;
  difficultyClass: string;
  difficultyText: string;
  isActive?: boolean;
  onActive?: (active: number) => void;
};

export default function Difficulty(props: DifficultyProps) {
  const [hover, setHover] = useState<boolean>(false);
  const { difficultyBarHeight, difficultyPressableMarginRight, difficultyTextWidth, difficultyTextHardWidth, fontSize } = useSizes();
  const difficultyIsHard: boolean = props.difficulty === 3;

  function handlePress() {
    if (props.onActive) {
      props.onActive(props.difficulty);
    }
  }

  return (
    <StyledPressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPress={handlePress}
      $backgroundColor={
        hover || props.isActive ? 'borderColor' : 'cellPrimaryBackground'
      }
      $height={difficultyBarHeight}
      $width={difficultyIsHard ? difficultyTextHardWidth : difficultyTextWidth}
      $marginRight={difficultyPressableMarginRight}
    >
      <StyledText $fontSize={fontSize}>{props.difficultyText}</StyledText>
    </StyledPressable>
  );
}
