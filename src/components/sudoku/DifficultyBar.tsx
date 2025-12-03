import React, {useState} from "react";
import Difficulty from "./Difficulty";
import {View, StyleSheet} from "react-native";
import {useSizes} from "./SizesContext";

type DifficultyProps = {
    onClick?(difficulty: number): void
}

export default function DifficultyBar(props: DifficultyProps) {
    const [activeDifficulty, setActiveDifficulty] = useState<number | null>(null);
    const { difficultyBarHeight, sudokuWidth } = useSizes()

    function handleActive(difficulty: number) {
        setActiveDifficulty(difficulty);
        console.log("selected difficulty:", difficulty);
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
        <View style={[styles.difficultyBar, { height: difficultyBarHeight, width: sudokuWidth}]}>
            {difficultyList.map((option: any, index: number) => (
                <Difficulty
                    key={index}
                    difficulty={index}
                    difficultyclass={option.difficultyClass}
                    difficultyText={option.difficultyText}
                    isActive={activeDifficulty === index}
                    onActive={handleActive}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    difficultyBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        position: "relative",
    },
})