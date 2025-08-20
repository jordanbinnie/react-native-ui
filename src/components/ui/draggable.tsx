import React, { useState } from "react";
import { ViewProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { cn } from "../../libs/utils";

type DragAxis = "x" | "y";

export type DragEndEvent = {
  thresholdReached: boolean;
  axis: DragAxis;
  direction: "up" | "down" | "left" | "right";
};

const DRAG_THRESHOLD = 0.3;
const VELOCITY_THRESHOLD = 800;

// iOS-style progressive rubber band effect
const applyRubberBandEffect = (distance: number, dimension: number) => {
  "worklet";
  const absDistance = Math.abs(distance);
  const constant = 0.55;
  const result =
    (1.0 - 1.0 / ((absDistance * constant) / dimension + 1.0)) * dimension;
  return distance < 0 ? -result : result;
};

const calculateThresholdAndDirection = (
  axis: DragAxis,
  dimension: number,
  translation: number
) => {
  "worklet";

  const dragThresholdReached = translation > dimension * DRAG_THRESHOLD;
  const velocityThresholdReached = translation > VELOCITY_THRESHOLD;
  const thresholdReached = dragThresholdReached || velocityThresholdReached;

  let direction: "up" | "down" | "left" | "right" = "up";
  if (axis === "x") direction = translation > 0 ? "right" : "left";
  if (axis === "y") direction = translation > 0 ? "down" : "up";

  return {
    thresholdReached,
    direction,
  };
};

export const Draggable = ({
  children,
  className,
  style,
  onLayout,
  axis = "y",
  onDragStart,
  onDragEnd,
  ...props
}: ViewProps & {
  axis?: DragAxis;
  onDragStart?: () => void;
  onDragEnd?: (event: DragEndEvent) => void;
}) => {
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      const nextX = applyRubberBandEffect(event.translationX, width);
      const nextY = applyRubberBandEffect(event.translationY, height);

      if (axis === "x") translateX.value = nextX;
      if (axis === "y") translateY.value = nextY;
    })
    .onEnd((event) => {
      const { thresholdReached, direction } = calculateThresholdAndDirection(
        axis,
        axis === "x" ? width : height,
        axis === "x" ? event.translationX : event.translationY
      );

      if (axis === "y") {
        if (!thresholdReached) {
          // Bounce back to original position
          translateY.value = withSpring(0, {
            damping: 28,
            stiffness: 300,
          });
        }

        //  TODO: don't hardcode this
        if (thresholdReached && direction === "down") {
          translateY.value = withTiming(height, { duration: 200 });
        }

        if (onDragEnd) {
          runOnJS(onDragEnd)({
            thresholdReached,
            axis,
            direction,
          });
        }
      }

      //  TODO: handle x axis
      //   if (axis === "x") {
      //   }
    })
    .simultaneousWithExternalGesture();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: axis === "y" ? 0 : translateX.value },
        { translateY: axis === "x" ? 0 : translateY.value },
      ],
    } as const;
  }, [axis]);

  return (
    <GestureDetector gesture={panGesture}>
      <Reanimated.View
        className={cn(className)}
        style={[animatedStyle, style]}
        onLayout={(event) => {
          const { height, width } = event.nativeEvent.layout;
          setHeight(height);
          setWidth(width);
          onLayout?.(event);
        }}
        {...props}
      >
        {children}
      </Reanimated.View>
    </GestureDetector>
  );
};
