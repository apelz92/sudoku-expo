import React from "react";
import Difficulty from "./Difficulty";
import { View, StyleSheet } from "react-native";
import { useSizes } from "./ResponsiveDesign";

type DifficultyProps = {
    onClick?(difficulty: number): void
    setActiveDifficulty?(difficulty: number): void
    activeDifficulty: number | null
}

export default function DifficultyBar(props: DifficultyProps) {
    const { difficultyBarHeight, sudokuWidth } = useSizes()

    function handleActive(difficulty: number) {
        props.setActiveDifficulty?.(difficulty)
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
                    difficultyClass={option.difficultyClass}
                    difficultyText={option.difficultyText}
                    isActive={props.activeDifficulty === index}
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