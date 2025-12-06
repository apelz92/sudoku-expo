import {TextInput, StyleSheet, Pressable, Platform} from "react-native";
import { RefObject, useState } from "react";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type CellProps = {
    id: string
    row: number
    column: number
    index: number
    value: string
    isReadOnly: boolean
    hasVerticalBorder: boolean
    hasHorizontalBorder: boolean
    ref: RefObject<TextInput>
    refs: RefObject<TextInput>[]
    handleKeyPress?: () => void
    onChange?: () => void
    onChangeText?: () => void
    updateValue:(index: number, e: any) => void
}

export default function Cell(props: CellProps) {
    const [focus, setFocus] = useState<boolean>(false)
    const [hover, setHover] = useState<boolean>(false)
    const { innerBorder, blockBorders, cellSize, cellFontSize } = useSizes();
    function handleKeyPress(e: any) {
        const key = e.nativeEvent.key
        if (!props.isReadOnly) {
            const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
            if (/[1-9]/.test(key) && !/F[1-9]/.test(key)) {
                props.ref.current.clear()
                props.updateValue(props.index, key)
            } else if (arrowKeys.includes(key)) {
                let targetIndex = props.index;
                if (key === "ArrowLeft") targetIndex = props.index > 0 ? props.index - 1 : props.refs.length - 1;
                if (key === "ArrowRight") targetIndex = (props.index + 1) % props.refs.length;
                if (key === "ArrowUp") {
                    if (props.index - 9 >= 0) {
                        targetIndex = props.index - 9;
                    } else {
                        const bottomRowIndex = (9 - 1) * 9 + props.index % 9;
                        targetIndex = props.index % 9 > 0 ? bottomRowIndex - 1 : bottomRowIndex + 8;
                    }
                }
                if (key === "ArrowDown") {
                    if (props.index + 9 < props.refs.length) {
                        targetIndex = props.index + 9;
                    } else {
                        const columnIndex = props.index % 9;
                        targetIndex = columnIndex < 9 - 1 ? columnIndex + 1 : columnIndex - 8;
                    }
                }
                props.refs[targetIndex]?.current?.focus();
            } else if (key === "Delete" || key === "Backspace") {
                props.ref.current.clear()
                //props.updateValue(props.index, "")
            } else if (key === "l") {
                console.log("props:", props)
            } else if (/F[1-9]/.test(key)) { }
            else {
                e.preventDefault()
            }
        }
    }

    const paddingBottom = (() => {
        if (Platform.OS === "android") {
            return 2
        }
        else {
            return 8
        }
    })()

    return (
        <Pressable
            onHoverIn={() => setHover(true)}
            onHoverOut={() => setHover(false)}
            onPress={() => props.ref.current?.focus()}
            style={({ pressed }) => [
                styles.cell,
                props.hasVerticalBorder ? {
                    borderRightWidth: blockBorders,
                    borderRightColor: COLORS.borderColor,
                    width: cellSize + blockBorders,
                } : {width: cellSize},
                props.hasHorizontalBorder ? {
                    borderBottomWidth: blockBorders,
                    borderBottomColor: COLORS.borderColor,
                    height: cellSize + blockBorders,
                } : {height: cellSize},
                {
                    backgroundColor: pressed ? COLORS.cellActive : COLORS.cellBackground &&
                        focus ? COLORS.cellActive : COLORS.cellBackground &&
                        hover ? COLORS.cellHover : COLORS.cellBackground,
                    borderWidth: innerBorder,
                },
            ]}
        >
            <TextInput
                id={props.id}
                readOnly={props.isReadOnly}
                value={props.value}
                ref={props.ref}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                inputMode={"numeric"}
                caretHidden={true}
                cursorColor={"rbga(0,0,0,0)"}
                onKeyPress={handleKeyPress}
                onChangeText={props.onChangeText}
                style={[
                    styles.input,
                    props.hasVerticalBorder ?
                        {width: cellSize + blockBorders}
                        : {width: cellSize},
                    props.hasHorizontalBorder ?
                        {height: cellSize + blockBorders}
                        : {height: cellSize},
                    {
                        outlineWidth: 0,
                        outlineColor: "transparent",
                        fontSize: cellFontSize,
                        paddingBottom: paddingBottom,
                    }
                ]}
                selectionColor={"rgba(0,0,0,0)"}
                >
            </TextInput>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    input: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        margin: -1,
        backgroundColor: "transparent",
        position: "relative",
        textAlign: "center",
        color: COLORS.fontColor,
    },
    cell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "solid",
        borderColor: COLORS.innerBorderColor,
        position: "relative",
        textAlign: "center",
        backgroundColor: COLORS.cellBackground,
    },
    verticalBorder: {
        borderRightWidth: 3,
        borderColor: COLORS.borderColor,
    },
    horizontalBorder: {
        borderBottomWidth: 3,
        borderColor: COLORS.borderColor,
    },
})
