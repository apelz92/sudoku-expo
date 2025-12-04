import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import Sudoku from "./components/sudoku/Sudoku";
import { COLORS } from "./components/sudoku/theme";
import { ResponsiveDesign } from "./components/sudoku/ResponsiveDesign";

export default function App() {
    return (
        <ResponsiveDesign>
            <View style={styles.root}>
                <Sudoku></Sudoku>
                <StatusBar/>
            </View>
        </ResponsiveDesign>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.appBackground,
    }
})