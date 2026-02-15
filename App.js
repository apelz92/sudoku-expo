import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import styled from 'styled-components/native';
import Sudoku from "./src/components/sudoku/Sudoku";
import { defaultTheme } from "./src/components/sudoku/theme";
import { ResponsiveDesign } from "./src/components/sudoku/ResponsiveDesign";

const StyledRoot = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.appBackground};
`;

export default function App() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <StyledRoot>
                <ResponsiveDesign>
                    <Sudoku></Sudoku>
                    <StatusBar/>
                </ResponsiveDesign>
            </StyledRoot>
        </ThemeProvider>
    );
}