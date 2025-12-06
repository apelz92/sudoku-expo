import {Dimensions} from "react-native";

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
    cellBackground: "#20272e",
    cellHover: "#33354a",
    cellActive: "#42455e",
    fontColor: "#c6c7d6",
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
};

export function calculateSizes() {
    const { height, width } = Dimensions.get("window")
    const outerBorder = 2
    const innerBorder = 1
    const cellSize =
        Math.max(
            Math.min(
                Math.floor(
                    Math.min(
                        height / 9 - height / 9 * 0.12, width / 9 - 1
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
    const viewHeight = sudokuHeight + difficultyBarHeight

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