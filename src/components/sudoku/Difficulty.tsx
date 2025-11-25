import React from "react";

type DifficultyProps = {
    difficulty: number
    difficultyclass: string
    difficultyText: string
    onClick?: () => void
}

export default function Difficulty(props: DifficultyProps) {
    return (
        <div
            className={"difficulty difficulty-bar-" + props.difficultyclass}
            onClick={props.onClick}>{props.difficultyText}
        </div>
    )
}