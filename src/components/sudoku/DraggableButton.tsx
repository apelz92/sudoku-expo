import React, { useRef, useState } from "react";
import { Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    withTiming,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

type DraggableButtonProps = {
    value: string;
    label?: string;
    dragLabel?: string;
    onTap: () => void;
    onDragStart: () => void;
    onDragMove: (x: number, y: number) => void;
    onDragEnd: (x: number, y: number) => void;
    styleOverride?: StyleProp<ViewStyle>;
};

export default function DraggableButton({
                                            value,
                                            label,
                                            dragLabel,
                                            onTap,
                                            onDragStart,
                                            onDragMove,
                                            onDragEnd,
                                            styleOverride,
                                        }: DraggableButtonProps) {
    const { cellSize } = useSizes();
    const [isDraggingState, setIsDraggingState] = useState(false);

    const baseWidth = Math.floor(cellSize * 1.6);
    const baseHeight = Math.floor(baseWidth / 1.5);
    const targetSize = Math.floor(cellSize);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const widthVal = useSharedValue(baseWidth);
    const heightVal = useSharedValue(baseHeight);
    const isDragging = useSharedValue(false);

    const initialCenterX = useSharedValue(0);
    const initialCenterY = useSharedValue(0);
    const measured = useSharedValue(0);

    const viewRef = useRef<any>(null);
    const DRAG_THRESHOLD = 6;

    useAnimatedReaction(
        () => isDragging.value,
        (dragging) => {
            scheduleOnRN(() => setIsDraggingState(dragging));
        }
    );

    const measureInitialCenter = () => {
        if (!viewRef.current || typeof viewRef.current.measureInWindow !== "function") {
            measured.value = 1;
            return;
        }
        requestAnimationFrame(() => {
            viewRef.current.measureInWindow((left: number, top: number, w: number, h: number) => {
                initialCenterX.value = left + w / 2;
                initialCenterY.value = top + h / 2;
                measured.value = 1;
            });
        });
    };

    const dragGesture = Gesture.Pan()
        .onUpdate((e) => {
            const movedX = Math.abs(e.translationX);
            const movedY = Math.abs(e.translationY);

            if (!isDragging.value) {
                if (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD) {
                    if (measured.value === 0) {
                        scheduleOnRN(() => measureInitialCenter());
                        return;
                    }
                    if (measured.value === 1) {
                        isDragging.value = true;
                        widthVal.value = withTiming(targetSize, { duration: 120 });
                        heightVal.value = withTiming(targetSize, { duration: 120 });
                        scheduleOnRN(() => onDragStart());
                    }
                }
            }

            if (isDragging.value) {
                translateX.value = e.absoluteX - initialCenterX.value;
                translateY.value = e.absoluteY - initialCenterY.value;
                scheduleOnRN(() => onDragMove(e.absoluteX, e.absoluteY));
            } else {
                translateX.value = e.translationX;
                translateY.value = e.translationY;
            }
        })
        .onEnd((e) => {
            if (isDragging.value) {
                scheduleOnRN(() => onDragEnd(e.absoluteX, e.absoluteY));
                widthVal.value = withTiming(baseWidth, { duration: 150 });
                heightVal.value = withTiming(baseHeight, { duration: 150 });
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                isDragging.value = false;
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
            measured.value = 0;
            initialCenterX.value = 0;
            initialCenterY.value = 0;
        });

    const tapGesture = Gesture.Tap().onEnd(() => {
        scheduleOnRN(() => onTap());
    });

    const combinedGesture = Gesture.Race(tapGesture, dragGesture);

    const animatedStyle = useAnimatedStyle(() => {
        const currentWidth = widthVal.value;
        const shadow = isDragging.value
            ? "0px 4px 10px rgba(0, 0, 0, 0.35)"
            : "0px 2px 4px rgba(0, 0, 0, 0.15)";

        return {
            width: currentWidth,
            height: heightVal.value,
            borderRadius: Math.floor(currentWidth * 0.12),
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
            opacity: 0.95,
            boxShadow: shadow,
            elevation: isDragging.value ? 8 : 2,
        } as const;
    });


    const displayText = isDraggingState && dragLabel ? dragLabel : (label ?? value);

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View
                ref={viewRef}
                style={[styles.button, styleOverride, animatedStyle, { margin: Math.floor(cellSize / 10) }]}
            >
                <Text style={[styles.text, { fontSize: Math.floor(baseWidth / 3) }]}>
                    {displayText}
                </Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 6,
        backgroundColor: COLORS.cellPrimaryBackground,
        borderWidth: 1,
        borderColor: COLORS.innerBorderColor,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 3,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
        elevation: 3,
    },
    text: {
        color: COLORS.primaryFontColor,
        fontWeight: "700",
    },
});
