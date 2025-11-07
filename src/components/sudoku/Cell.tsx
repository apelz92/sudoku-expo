import {TextInput} from "react-native";
import {useState, RefObject} from "react";

type CellProps = {
    id: string
    row: number
    column: number
    index: number
    value: number
    grid: gridItem[]
    refs: RefObject<TextInput>[];
    handleFocus?: () => void
    handleBlur?: () => void
    handleKeyPress?: () => void
}

interface gridItem {
    index: number;
    row: number;
    column: number;
    value: string;
}

export default function Cell(props: CellProps) {
    const [grid] = useState(props.grid)
    const initialValue = ""
    const [value, setValue] = useState(initialValue)
    function handleFocus(e: any) {
        e.preventDefault()
    }
    function handleKeyPress(e: any) {
        const arrowKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
        if (/[1-9]/.test(e.code)) {
            setValue(e.key)
            grid[props.index].value = e.key.toString()
        } else if (arrowKeys.includes(e.code)) {
            let targetIndex = props.index;
            if (e.code === "ArrowLeft") targetIndex = props.index > 0 ? props.index - 1 : props.refs.length - 1;
            if (e.code === "ArrowRight") targetIndex = (props.index + 1) % props.refs.length;
            if (e.code === "ArrowUp") {
                if (props.index - 9 >= 0) {
                    targetIndex = props.index - 9;
                } else {
                    const bottomRowIndex = (9 - 1) * 9 + props.index % 9;
                    targetIndex = props.index % 9 > 0 ? bottomRowIndex - 1 : bottomRowIndex + 8;
                }
            }
            if (e.code === "ArrowDown") {
                if (props.index + 9 < props.refs.length) {
                    targetIndex = props.index + 9;
                } else {
                    const columnIndex = props.index % 9;
                    targetIndex = columnIndex < 9 - 1 ? columnIndex + 1 : columnIndex - 8;
                }
            }
            props.refs[targetIndex]?.current?.focus();
        } else if (e.code === "Delete" || e.code === "Backspace") {
            setValue(" ")
            grid[props.index].value = "";
        } else if (e.code === "KeyL") {
            console.log(props)
        }
        else {
            e.preventDefault()
        }
    }
    return (
        <TextInput
            id={props.id}
            value={value.toString()}
            ref={props.refs[props.index]}
            onFocus={handleFocus}
            onKeyPress={handleKeyPress}>
        </TextInput>
    )
}