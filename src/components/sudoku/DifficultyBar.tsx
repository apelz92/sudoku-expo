import React from "react";
import Difficulty from "./Difficulty";
import styled from 'styled-components/native';
import { useSizes } from "./ResponsiveDesign";

type StyledDifficultyBarProps = {
  $height: number;
  $width: number;
};

const StyledDifficultyBar = styled.View<StyledDifficultyBarProps>`
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  position: relative;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`;

type DifficultyProps = {
  onClick?: (difficulty: number) => void;
  setActiveDifficulty?: (difficulty: number) => void;
  activeDifficulty: number | null;
};

export default function DifficultyBar(props: DifficultyProps) {
  const { difficultyBarHeight, sudokuWidth } = useSizes();

  function handleActive(difficulty: number) {
    props.setActiveDifficulty?.(difficulty);
    if (props.onClick) {
      props.onClick(difficulty);
    }
  }

  const difficultyList = [
    { difficultyClass: "very-easy", difficultyText: "Very Easy" },
    { difficultyClass: "easy", difficultyText: "Easy" },
    { difficultyClass: "medium", difficultyText: "Medium" },
    { difficultyClass: "hard", difficultyText: "Hard" },
    { difficultyClass: "very-hard", difficultyText: "Very Hard" },
  ];

  return (
    <StyledDifficultyBar
      $height={difficultyBarHeight}
      $width={sudokuWidth}
    >
      {difficultyList.map((option, index: number) => (
        <Difficulty
          key={index}
          difficulty={index}
          difficultyClass={option.difficultyClass}
          difficultyText={option.difficultyText}
          isActive={props.activeDifficulty === index}
          onActive={handleActive}
        />
      ))}
    </StyledDifficultyBar>
  );
}
