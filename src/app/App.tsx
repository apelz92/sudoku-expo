import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Sudoku from "../components/sudoku/Sudoku";

type Props = {
    row: number
    column: number
    index: number
    value: number
    difficulty: number
    grid: Object[]
}

export default function App(props: Props) {

    return (
        <View>
            <Sudoku {...props}></Sudoku>
            <StatusBar/>
        </View>
    );
}