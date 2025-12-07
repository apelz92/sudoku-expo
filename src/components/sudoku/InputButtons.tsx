import React from "react";
import { View, StyleSheet } from "react-native";
import DraggableNumber from "./DraggableButton";
import { COLORS } from "./theme";

type InputButtonProps = {
    activeCell: number | null;
    updateCell: (index: number, value: string) => void;
    setDragValue: (v: string | null) => void;
    handleDragMove: (x: number, y: number) => void;
    handleDropRelease: (x: number, y: number) => void;
};

export default function InputButtons({activeCell, updateCell, setDragValue, handleDragMove, handleDropRelease,}: InputButtonProps) {
    return (
        <View style={styles.numberRow}>
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
        marginTop: 16,
        flexWrap: "wrap",
        gap: 10,
    },

    button: {
        width: 42,
        height: 42,

        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.innerBorderColor,

        backgroundColor: COLORS.cellBackground,  // same as cells

        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    clearButton: {
        backgroundColor: COLORS.borderColor,  // same as thicker block borders
    },

    buttonText: {
        color: COLORS.fontColor,
        fontSize: 20,
        fontWeight: "700",
    },
});
