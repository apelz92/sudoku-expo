import {TextInput} from "react-native";

type CellProps = {
    row: number,
    column: number,
    index: number,
    value: number,
}

export default function Cell(props: CellProps) {
    return (
        <TextInput
            id={"cell" + props.row + props.column}
            value={props.value.toString()}
            placeholder={"["+props.row+"]"+"["+props.column+"]"}>
        </TextInput>
    )
}