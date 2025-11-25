import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Sudoku from "../components/sudoku/Sudoku";



export default function App() {
    return (
        <View>
            <Sudoku></Sudoku>
            <StatusBar/>
        </View>
    );
}