import React, { useState } from "react";
import { Text, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import styled from 'styled-components/native';
import { COLORS } from "./theme";
import { useSizes } from "./ResponsiveDesign";

const ButtonContainer = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const StyledBaseView = styled.View`
  border-radius: 6px;
  background-color: ${COLORS.cellPrimaryBackground};
  border-width: 1px;
  border-color: ${COLORS.innerBorderColor};
  justify-content: center;
  align-items: center;
  padding-bottom: 3px;
`;

const StyledAnimatedView = styled(Animated.View)`
  border-radius: 6px;
  background-color: ${COLORS.cellPrimaryBackground};
  border-width: 1px;
  border-color: ${COLORS.innerBorderColor};
  justify-content: center;
  align-items: center;
  padding-bottom: 3px;
  position: absolute;
  left: 0;
  top: 0;
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
  const defaultLabel = label ?? value;
  const dragDisplayLabel = dragLabel ?? defaultLabel;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const DRAG_THRESHOLD = 6;
  const setDraggingState = (dragging: boolean) => {
    setIsDraggingState(dragging);
  };

  const dragGesture = Gesture.Pan()
    .onUpdate((event) => {
      const movedX = Math.abs(event.translationX);
      const movedY = Math.abs(event.translationY);

      if (!isDragging.value && (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD)) {
        isDragging.value = true;
        scheduleOnRN(setDraggingState, true);
        scheduleOnRN(onDragStart);
      }

      if (isDragging.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        scheduleOnRN(onDragMove, event.absoluteX, event.absoluteY);
      }
    })
    .onEnd((event) => {
      if (isDragging.value) {
        scheduleOnRN(onDragEnd, event.absoluteX, event.absoluteY);
      } else {
        scheduleOnRN(onTap);
      }

      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      scheduleOnRN(setDraggingState, false);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: 0.95,
      zIndex: 10,
      elevation: 10,
    };
  });
  const buttonWidth = Math.floor(cellSize * 1.6);
  const buttonHeight = cellSize;
  const buttonMargin = Math.floor(cellSize / 10);
  const textSize = Math.floor(buttonWidth / 3);
  const dragSquareSize = cellSize;
  const dragLeftOffset = Math.floor((buttonWidth - dragSquareSize) / 2);

  return (
    <GestureDetector gesture={dragGesture}>
      <ButtonContainer
        style={{
          width: buttonWidth,
          height: buttonHeight,
          margin: buttonMargin,
        }}
      >
        <StyledBaseView
          style={[
            styleOverride,
            {
              width: buttonWidth,
              height: buttonHeight,
              opacity: isDraggingState ? 0.3 : 0.95,
            },
          ]}
        >
          <StyledText style={{ fontSize: textSize }}>{defaultLabel}</StyledText>
        </StyledBaseView>

        {isDraggingState ? (
          <StyledAnimatedView
            pointerEvents="none"
            style={[
              styleOverride,
              animatedStyle,
              {
                width: dragSquareSize,
                height: dragSquareSize,
                left: dragLeftOffset,
              },
            ]}
          >
            <StyledText style={{ fontSize: textSize }}>{dragDisplayLabel}</StyledText>
          </StyledAnimatedView>
        ) : null}
      </ButtonContainer>
    </GestureDetector>
  );
}
