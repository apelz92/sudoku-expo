import React from "react";
import { View, StyleSheet } from "react-native";
import DraggableNumber from "./DraggableButton";
import { COLORS } from "./theme";
import {useSizes} from "./ResponsiveDesign";

type InputButtonProps = {
    activeCell: number | null;
    updateCell: (index: number, value: string) => void;
    setDragValue: (v: string | null) => void;
    handleDragMove: (x: number, y: number) => void;
    handleDropRelease: (x: number, y: number) => void;
};

export default function InputButtons({activeCell, updateCell, setDragValue, handleDragMove, handleDropRelease,}: InputButtonProps) {
    const { cellSize } = useSizes()
    return (
        <View style={[styles.numberRow, { marginTop: Math.floor(cellSize / 10) }]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <DraggableNumber
                    key={num}
                    value={String(num)}
                    onTap={() => {
                        if (activeCell !== null) {
                            updateCell(activeCell, String(num));
                        }
                    }}
                    onDragStart={() => setDragValue(String(num))}
                    onDragMove={(x, y) => handleDragMove(x, y)}
                    onDragEnd={(x, y) => handleDropRelease(x, y)}
                />
            ))}

            <DraggableNumber
                value=""
                label="Clear"
                styleOverride={styles.clearButton}
                onTap={() => {
                    if (activeCell !== null) {
                        updateCell(activeCell, "");
                    }
                }}
                onDragStart={() => setDragValue("")}
                onDragMove={(x, y) => handleDragMove(x, y)}
                onDragEnd={(x, y) => handleDropRelease(x, y)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    numberRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
    },

    clearButton: {
        backgroundColor: COLORS.borderColor,  // same as thicker block borders
    },
});
