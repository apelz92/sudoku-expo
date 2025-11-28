import React from "react";
import Difficulty from "./Difficulty";

type DifficultyProps = {
    onClick?(difficulty: number): void
}

export default function DifficultyBar(props: DifficultyProps) {
    const difficultyList = [{
        difficulty: 0,
        difficultyClass: "very-easy",
        difficultyText: "Very Easy"
    }, {
        difficulty: 1,
        difficultyClass: "easy",
        difficultyText: "Easy"
    }, {
        difficulty: 2,
        difficultyClass: "medium",
        difficultyText: "Medium"
    }, {
        difficulty: 3,
        difficultyclass: "hard",
        difficultyText: "Hard"
    }, {
        difficulty: 4,
        difficultyClass: "very-hard",
        difficultyText: "Very Hard"
    }]
    return (
        <div className="difficulty-bar">
            {difficultyList.map((option: any) => (
                <Difficulty
                    key={option.difficulty}
                    difficulty={option.difficulty}
                    difficultyclass={option.difficultyClass}
                    difficultyText={option.difficultyText}
                    onClick={props.onClick}/>
            ))}
        </div>
    )
}