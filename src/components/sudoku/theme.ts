import {Dimensions} from "react-native";

export const COLORS = {
    appBackground: "rgb(28,13,28)",
    cellBackground: "rgb(36,32,46)",
    cellHover: "rgb(73,56,89)",
    cellActive: "rgb(58,45,81)",
    fontColor: "rgb(225, 225, 225)",
    borderColor: "rgb(90,33,89)",
    innerBorderColor: "rgb(62,30,62)",
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
    const sudokuWidth = cellSize * 9 + (outerBorder * 2)
    const sudokuHeight = cellSize * 9 + (outerBorder * 2)
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