import React, { RefObject, useEffect } from "react";
import { TextInput, StyleSheet, Pressable, Platform } from "react-native";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type CellProps = {
    id: string;
    row: number;
    column: number;
    index: number;
    value: string;
    isReadOnly: boolean;
    hasVerticalBorder: boolean;
    hasHorizontalBorder: boolean;
    ref: RefObject<TextInput>;       // TextInput ref passed from parent
    refs: RefObject<TextInput>[];
    updateValue:(index: number, e: any) => void;
    setActiveCell: (index: number | null) => void;
    isActive?: boolean;
    isHovered?: boolean;
    onHoverIn?: () => void;
    onHoverOut?: () => void;
    onLayoutCell: (index: number, layout: { x:number, y:number, width:number, height:number }, isReadOnly: boolean) => void;
}

export default function Cell({
                                 isActive,
                                 isHovered,
                                 isReadOnly,
                                 onHoverIn,
                                 onHoverOut,
                                 ...props
                             }: CellProps) {
    const { innerBorder, blockBorders, cellSize, cellFontSize } = useSizes();

    const paddingBottom = Platform.OS === "android" ? 2 : 8;

    const getCellBackgroundColor = () => {
        if (isActive) return COLORS.cellActive;
        if (isHovered) return COLORS.cellHover;
        if (isReadOnly) return COLORS.cellSecondaryBackground;
        return COLORS.cellPrimaryBackground;
    };

    const measureAndReport = () => {
        const target = props.ref?.current;
        if (!target || typeof target.measureInWindow !== "function") return;
        try {
            target.measureInWindow((x, y, width, height) => {
                props.onLayoutCell(props.index, { x, y, width, height }, isReadOnly);
            });
        } catch (err) {
        }
    };

    useEffect(() => {
        const t = setTimeout(() => measureAndReport(), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <Pressable
            onLayout={() => {
                setTimeout(() => measureAndReport(), 0);
            }}
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
            onPress={() => props.ref.current?.focus()}
            style={() => [
                styles.cell,
                props.hasVerticalBorder ? {
                    borderRightWidth: blockBorders,
                    borderRightColor: COLORS.borderColor,
                    width: cellSize + blockBorders,
                } : {width: cellSize},
                props.hasHorizontalBorder ? {
                    borderBottomWidth: blockBorders,
                    borderBottomColor: COLORS.borderColor,
                    height: cellSize + blockBorders,
                } : {height: cellSize},
                {
                    backgroundColor: getCellBackgroundColor(),
                    borderWidth: innerBorder,
                },
            ]}
        >
            <TextInput
                id={props.id}
                editable={!isReadOnly}
                value={props.value}
                ref={props.ref}
                onFocus={() => props.setActiveCell(props.index)}
                onBlur={() => props.setActiveCell(null)}
                inputMode={"numeric"}
                caretHidden={true}
                cursorColor={"rgba(0,0,0,0)"}
                onKeyPress={(e) => {
                    const key = (e.nativeEvent as any).key;
                    if (!isReadOnly && /[1-9]/.test(key)) {
                        props.ref.current?.clear();
                        props.updateValue(props.index, key);
                    }
                }}
                style={[
                    styles.input,
                    props.hasVerticalBorder ? { width: cellSize + blockBorders } : { width: cellSize },
                    props.hasHorizontalBorder ? { height: cellSize + blockBorders } : { height: cellSize },
                    isReadOnly ? { color: COLORS.primaryFontColor } : { color: COLORS.secondaryFontColor },
                    { outlineWidth: 0, outlineColor: "transparent", fontSize: cellFontSize, paddingBottom }
                ]}
                selectionColor={"rgba(0,0,0,0)"}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    input: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        margin: -1,
        backgroundColor: "transparent",
        position: "relative",
        textAlign: "center",
        color: COLORS.primaryFontColor,
    },
    cell: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "solid",
        borderColor: COLORS.innerBorderColor,
        position: "relative",
        textAlign: "center",
        backgroundColor: COLORS.cellPrimaryBackground,
    },
});
