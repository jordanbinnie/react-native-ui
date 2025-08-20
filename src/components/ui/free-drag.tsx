import { useState } from "react";
import { Pressable, PressableProps } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  AnimatedProps,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export type FreeDragProps = AnimatedProps<PressableProps> & {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragMove?: (absoluteX: number, absoluteY: number) => void;
};

const LONG_PRESS_DURATION_MS = 500;
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);
const doHaptics = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

export const FreeDrag = ({
  children,
  onDragStart,
  onDragEnd,
  onDragMove,
  style,
  ...props
}: FreeDragProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const resetCompletions = useSharedValue(0);
  const [animationState, setAnimationState] = useState<
    "active" | "inactive" | "idle"
  >("inactive");

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DURATION_MS)
    .minDistance(0)
    .simultaneousWithExternalGesture()
    .onStart(() => {
      // Scale up slightly when drag activates
      scale.value = withSpring(1.06, { damping: 20, stiffness: 300 });

      runOnJS(setAnimationState)("active");
      runOnJS(doHaptics)();
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;

      if (onDragMove) {
        runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
      }
    })
    .onEnd(() => {
      // Snap back to origin on release
      resetCompletions.value = 0;
      const markDone = () => {
        "worklet";
        resetCompletions.value += 1;
        if (resetCompletions.value === 3) {
          runOnJS(setAnimationState)("inactive");
        }
      };

      runOnJS(setAnimationState)("idle");
      offsetX.value = 0;
      offsetY.value = 0;
      translateX.value = withSpring(
        0,
        { damping: 28, stiffness: 300 },
        markDone
      );
      translateY.value = withSpring(
        0,
        { damping: 28, stiffness: 300 },
        markDone
      );
      scale.value = withSpring(1, { damping: 20, stiffness: 300 }, markDone);

      if (onDragEnd) runOnJS(onDragEnd)();
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedPressable
        collapsable={false}
        style={animatedStyle}
        custom-state={animationState}
        {...props}
      >
        {children}
      </AnimatedPressable>
    </GestureDetector>
  );
};
