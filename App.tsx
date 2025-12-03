import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet} from 'react-native';
import Sudoku from "./src/components/sudoku/Sudoku";
import {COLORS} from "./src/components/sudoku/theme";
import {SizesProvider} from "./src/components/sudoku/SizesContext";

export default function App() {
    return (
        <SizesProvider>
            <View style={styles.root}>
                <Sudoku></Sudoku>
                <StatusBar/>
            </View>
        </SizesProvider>
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