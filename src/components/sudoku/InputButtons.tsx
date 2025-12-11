import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";
import DraggableButton from "./DraggableButton";

type InputButtonProps = {
    activeCell: number | null;
    updateCell: (index: number, value: string) => void;
    isReadOnly: (index: number) => boolean;
    setDragValue: (v: string | null) => void;
    handleDragMove: (x: number, y: number) => void;
    handleDropRelease: (x: number, y: number) => void;
};

export default function InputButtons({
                                         activeCell,
                                         updateCell,
                                         isReadOnly,
                                         setDragValue,
                                         handleDragMove,
                                         handleDropRelease,
                                     }: InputButtonProps) {
    const { cellSize } = useSizes();

    const handleTap = (value: string) => {
        if (activeCell !== null && !isReadOnly(activeCell)) {
            updateCell(activeCell, value);
        }
    };

    return (
        <View key={"InputButtons"} style={[ styles.numberRow, {
                                            marginTop: Math.floor(cellSize / 10),
                                            height: Math.floor(cellSize * 2.5)
        }]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <DraggableButton
                    key={num}
                    value={String(num)}
                    onTap={() => handleTap(String(num))}
                    onDragStart={() => setDragValue(String(num))}
                    onDragMove={(x, y) => handleDragMove(x, y)}
                    onDragEnd={(x, y) => handleDropRelease(x, y)}
                />
            ))}

            <DraggableButton
                value="clear"
                label="Clear"
                dragLabel="Clr"
                onTap={() => handleTap("")}
                onDragStart={() => setDragValue("")}
                onDragMove={(x, y) => handleDragMove(x, y)}
                onDragEnd={(x, y) => handleDropRelease(x, y)}
                styleOverride={styles.clearButton}
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
        overflow: "visible",
    },
    clearButton: {
        backgroundColor: COLORS.borderColor,
        borderColor: COLORS.borderColor,
        borderWidth: 2,
    },
});
