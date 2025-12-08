import React, { useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

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
    const difficultyIsHard: boolean = props.difficulty == 3;

    function handlePress() {
        if (props.onActive) {
            props.onActive(props.difficulty);
        }
    }

    return (
        <Pressable
            onHoverIn={() => setHover(true)}
            onHoverOut={() => setHover(false)}
            onPress={handlePress}
            style={[
                styles.base,
                {
                    backgroundColor:
                        hover ? COLORS.borderColor : COLORS.cellPrimaryBackground &&
                        props.isActive ? COLORS.borderColor : COLORS.cellPrimaryBackground,
                    height: difficultyBarHeight,
                    width: difficultyIsHard ? difficultyTextHardWidth : difficultyTextWidth,
                    marginRight: difficultyPressableMarginRight,
                },
            ]}
        >
            <Text style={[styles.text, {fontSize: fontSize}]}>{props.difficultyText}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginRight: 3,
        padding: 3,
        borderStyle: "solid",
        cursor: "auto",
        userSelect: "none",
    },
    text: {
        textAlign: "center",
        textAlignVertical: "center",
        fontFamily: "system-ui",
        fontWeight: "700",
        color: COLORS.primaryFontColor,
    },
});