import React from "react";
import { Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type DraggableButtonProps = {
    value: string;
    label?: string;
    onTap: () => void;
    onDragStart: () => void;
    onDragMove: (x: number, y: number) => void;
    onDragEnd: (x: number, y: number) => void;
    styleOverride?: StyleProp<ViewStyle>
};

export default function DraggableButton({ value, label, onTap, onDragStart, onDragMove, onDragEnd, styleOverride }: DraggableButtonProps) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const { cellSize } = useSizes()

    const dragGesture = Gesture.Pan()
        .onBegin(() => {
            scale.value = withTiming(1.2, { duration: 120 });
            runOnJS(onDragStart)();
        })
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
            runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
        })
        .onEnd((e) => {
            const { absoluteX, absoluteY } = e;

            scale.value = withTiming(1, { duration: 150 });

            translateX.value = withSpring(0);
            translateY.value = withSpring(0);

            runOnJS(onDragEnd)(absoluteX, absoluteY);
        });

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            runOnJS(onTap)();
        });

    const combinedGesture = Gesture.Race(tapGesture, dragGesture);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: 0.95,
        shadowOpacity: scale.value > 1 ? 0.35 : 0.15,
        shadowRadius: scale.value > 1 ? 10 : 4,
        elevation: scale.value > 1 ? 8 : 2,
    }));

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.button, styleOverride, style, { width: Math.floor(cellSize * 1.6), margin: Math.floor(cellSize / 10)}]}>
            <Text style={[styles.text, { fontSize: Math.floor((cellSize * 1.6) / 3) }]}>
                    {label ?? value}
                </Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 42,
        height: 42,
        borderRadius: 6,

        backgroundColor: COLORS.cellBackground,
        borderWidth: 1,
        borderColor: COLORS.innerBorderColor,

        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 3,

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    text: {
        color: COLORS.fontColor,
        fontWeight: "700",
    },
});

