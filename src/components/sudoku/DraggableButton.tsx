import React, {useEffect, useRef, useState} from "react";
import { Text, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedReaction,
    withTiming,
    withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

const StyledAnimatedView = styled(Animated.View)`
  border-radius: 6px;
  background-color: ${COLORS.cellPrimaryBackground};
  border-width: 1px;
  border-color: ${COLORS.innerBorderColor};
  justify-content: center;
  align-items: center;
  padding-bottom: 3px;
`;

const StyledText = styled(Text)`
  color: ${COLORS.primaryFontColor};
  font-weight: 700;
`;

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

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const widthVal = useSharedValue(Math.floor(cellSize * 1.6));
  const heightVal = useSharedValue(cellSize);

  const isDragging = useSharedValue(false);

  const initialCenterX = useSharedValue(0);
  const initialCenterY = useSharedValue(0);
  const measured = useSharedValue(0);

  const viewRef = useRef<any>(null);
  const DRAG_THRESHOLD = 6;

  useEffect(() => {
    if (!isDragging.value) {
      widthVal.value = Math.floor(cellSize * 1.6);
      heightVal.value = cellSize;
    }
  }, [cellSize]);

  useAnimatedReaction(
    () => isDragging.value,
    (dragging) => {
      "worklet";
      setIsDraggingState(dragging);
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
      "worklet";
      const movedX = Math.abs(e.translationX);
      const movedY = Math.abs(e.translationY);

      if (!isDragging.value) {
        if (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD) {
          if (measured.value === 0) {
            measureInitialCenter();
            return;
          }
          if (measured.value === 1) {
            isDragging.value = true;
            widthVal.value = withTiming(cellSize, { duration: 120 });
            heightVal.value = withTiming(cellSize, { duration: 120 });
            onDragStart();
          }
        }
      }

      if (isDragging.value) {
        translateX.value = e.absoluteX - initialCenterX.value;
        translateY.value = e.absoluteY - initialCenterY.value;
        onDragMove(e.absoluteX, e.absoluteY);
      } else {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      "worklet";
      if (isDragging.value) {
        onDragEnd(e.absoluteX, e.absoluteY);
        widthVal.value = withTiming(Math.floor(cellSize * 1.6), { duration: 150 });
        heightVal.value = withTiming(cellSize, { duration: 150 });
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
    "worklet";
    onTap();
  });

  const combinedGesture = Gesture.Race(tapGesture, dragGesture);

  const animatedStyle = useAnimatedStyle(() => {
    const currentWidth = widthVal.value;
    return {
      width: currentWidth,
      height: heightVal.value,
      borderRadius: Math.floor(currentWidth * 0.12),
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: 0.95,
      elevation: isDragging.value ? 8 : 2,
    };
  });

  const displayText = isDraggingState && dragLabel ? dragLabel : (label ?? value);

  return (
    <GestureDetector gesture={combinedGesture}>
      <StyledAnimatedView
        ref={viewRef}
        style={[
          styleOverride,
          animatedStyle,
          { 
            width: Math.floor(cellSize * 1.6), 
            height: cellSize, 
            margin: Math.floor(cellSize / 10) 
          }
        ]}
      >
        <StyledText style={{ fontSize: Math.floor(cellSize * 1.6 / 3) }}>
          {displayText}
        </StyledText>
      </StyledAnimatedView>
    </GestureDetector>
  );
}
