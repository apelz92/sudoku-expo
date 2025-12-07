import { Pressable, StyleSheet, View, Text } from "react-native";
import { COLORS } from "./theme";

type InputButtonProps = {
    activeCell: number | null,
    updateCell: (index: number, newValue: string) => void,
}

export default function InputButtons(props: InputButtonProps) {

    return (
        <View style={styles.numberRow}>
            {[1,2,3,4,5,6,7,8,9].map((num) => (
                <Pressable
                    key={num}
                    style={styles.numberButton}
                    onPress={() => {
                        if (props.activeCell !== null) props.updateCell(props.activeCell, String(num));
                    }}
                >
                    <Text style={styles.numberButtonText}>{num}</Text>
                </Pressable>
            ))}

            <Pressable
                style={[styles.numberButton, styles.clearButton]}
                onPress={() => {
                    if (props.activeCell !== null) props.updateCell(props.activeCell, "");
                }}
            >
                <Text style={styles.numberButtonText}>Clear</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    numberRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        flexWrap: "wrap",
    },

    numberButton: {
        width: 40,
        height: 40,
        borderRadius: 6,
        margin: 5,
        backgroundColor: COLORS.cellBackground,
        borderWidth: 1,
        borderColor: COLORS.innerBorderColor,
        justifyContent: "center",
        alignItems: "center",
    },

    clearButton: {
        backgroundColor: COLORS.borderColor,
    },

    numberButtonText: {
        color: COLORS.fontColor,
        fontSize: 20,
        fontWeight: "bold",
    },
})