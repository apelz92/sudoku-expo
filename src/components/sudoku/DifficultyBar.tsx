import React, {useState} from "react";
import Difficulty from "./Difficulty";

type DifficultyProps = {
    onClick?: () => void
}

export default function DifficultyBar(props: DifficultyProps) {
    const difficultyList = [{
        difficulty: 1,
        difficultyClass: "very-easy",
        difficultyText: "Very Easy"
    }, {
        difficulty: 2,
        difficultyClass: "easy",
        difficultyText: "Easy"
    }, {
        difficulty: 3,
        difficultyClass: "medium",
        difficultyText: "Medium"
    }, {
        difficulty: 4,
        difficultyclass: "hard",
        difficultyText: "Hard"
    }, {
        difficulty: 5,
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