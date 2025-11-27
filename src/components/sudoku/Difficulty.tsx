import React from "react";

type DifficultyProps = {
    difficulty: number
    difficultyclass: string
    difficultyText: string
    onClick?(difficulty: number): void
}

export default function Difficulty(props: DifficultyProps) {
    return (
        <div
            className={"difficulty difficulty-bar-" + props.difficultyclass}
            onClick={() => props.onClick ? props.onClick(props.difficulty): null}>{props.difficultyText}
        </div>
    )
}