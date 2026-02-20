import {Dimensions} from "react-native";

/**
 * @fileoverview Theme definitions for the Sudoku application, including color schemes and responsive size calculations.
 * This file provides the visual styling constants and dynamic sizing functions used throughout the app's components.
 */

/**
 * @const {Object} COLORS - Color palette for the Sudoku app's UI theme.
 * Defines background colors, cell colors, font colors, and border colors.
 * Currently using Theme 3 (dark theme with blue accents).
 * @property {string} appBackground - Background color of the entire app.
 * @property {string} cellPrimaryBackground - Primary background color for Sudoku cells.
 * @property {string} cellSecondaryBackground - Secondary background color for Sudoku cells.
 * @property {string} cellHover - Color for hovered cells.
 * @property {string} cellActive - Color for active/selected cells.
 * @property {string} primaryFontColor - Primary font color for text.
 * @property {string} secondaryFontColor - Secondary font color for text.
 * @property {string} primary - Primary accent color.
 * @property {string} borderColor - Color for outer borders.
 * @property {string} innerBorderColor - Color for inner borders.
 */
export const COLORS = {
//  Theme 1
/*    appBackground: "rgb(28,13,28)",
    cellBackground: "rgb(36,32,46)",
    cellHover: "rgb(58,45,81)",
    cellActive: "rgb(73,56,89)",
    fontColor: "rgb(225, 225, 225)",
    borderColor: "rgb(90,33,89)",
    innerBorderColor: "rgb(62,30,62)",*/

//  Theme 2
/*    appBackground: "#1c1a1d",
    cellBackground: "#372d39",
    cellHover: "#604257",
    cellActive: "#6e5366",
    fontColor: "rgb(225, 225, 225)",
    borderColor: "#6c4662",
    innerBorderColor: "#633657",*/

//  Theme 3
    appBackground: "#14141b",
    cellPrimaryBackground: "#20272e",
    cellSecondaryBackground: "#1f2229",
    cellHover: "#33354a",
    cellActive: "#42455e",
    primaryFontColor: "#c6c7d6",
    secondaryFontColor: "#aab2ed",
    primary: "#ff8f9f",
    borderColor: "#42455e",
    innerBorderColor: "#33354a",

//  Theme 4
/*    appBackground: "#1d1723",
    cellBackground: "#27202e",
    cellHover: "#3f334a",
    cellActive: "#51425e",
    fontColor: "#bfb2ca",
    borderColor: "#51425e",
    innerBorderColor: "#3f334a",*/

    //  Theme 4
    /*  canvagent colours
    * primary: "#FFAAAA",
    * primary: "#D46A6A",
    * primary: "#AA3939",
    * primary: "#801515",
    * primary: "#550000",
    * */
};

/**
 * @const {Object} defaultTheme - Default theme object containing colors and size calculation function.
 * @property {Object} colors - Reference to the COLORS object.
 * @property {Function} sizes - Function to calculate responsive sizes based on window dimensions.
 */
export const defaultTheme = {
    colors: COLORS,
    sizes: calculateSizes,
};

/**
 * Calculates responsive sizes for the Sudoku grid and UI elements based on the device's window dimensions.
 * @returns {Object} An object containing calculated sizes for various UI elements.
 * @property {number} outerBorder - Width of the outer border around the Sudoku grid.
 * @property {number} innerBorder - Width of inner borders between cells.
 * @property {number} blockBorders - Width of borders between 3x3 blocks.
 * @property {number} cellSize - Size of each Sudoku cell in pixels.
 * @property {number} sudokuWidth - Total width of the Sudoku grid including borders.
 * @property {number} sudokuHeight - Total height of the Sudoku grid including borders.
 * @property {number} difficultyBarHeight - Height of the difficulty selection bar.
 * @property {number} difficultyPressableMarginRight - Right margin for difficulty buttons.
 * @property {number} difficultyTextWidth - Width of difficulty text buttons.
 * @property {number} difficultyTextHardWidth - Width of the "Very Hard" difficulty button.
 * @property {number} viewHeight - Total height of the main view including grid and bar.
 * @property {number} cellFontSize - Font size for numbers inside cells.
 * @property {number} fontSize - General font size for UI text.
 */
export function calculateSizes() {
    const { height, width } = Dimensions.get("window")
    const outerBorder = 2
    const innerBorder = 1
    const cellSize =
        Math.max(
            Math.min(
                Math.floor(
                    Math.min(
                        (height / 9) - ((height / 9) * 0.285), width / 9 - 1
                    )
                ),
                60
            ),
            30
        )
    const blockBorders = cellSize < 45 ? 2 : 4
    const sudokuWidth = cellSize * 9 + (outerBorder * 2) + (blockBorders * 2)
    const sudokuHeight = cellSize * 9 + (outerBorder * 2) + (blockBorders * 2)
    const cellFontSize = Math.floor(cellSize / 1.5)
    const fontSize = Math.floor(cellSize / 3.1)
    const difficultyBarHeight = cellSize
    const difficultyPressableMarginRight = 3
    const difficultyTextWidth = Math.floor((sudokuWidth + difficultyPressableMarginRight) / 5)
    const difficultyTextHardWidth = sudokuWidth - ((difficultyTextWidth + difficultyPressableMarginRight) * 4)
    const viewHeight = sudokuHeight + difficultyBarHeight + Math.floor(cellSize * 2.5)

    return {
        outerBorder,
        innerBorder,
        blockBorders,
        cellSize,
        sudokuWidth,
        sudokuHeight,
        difficultyBarHeight,
        difficultyPressableMarginRight,
        difficultyTextWidth,
        difficultyTextHardWidth,
        viewHeight,
        cellFontSize,
        fontSize
    };
}
