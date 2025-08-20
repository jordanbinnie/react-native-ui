import React from "react";
import {
  BackHandler,
  Dimensions,
  Pressable,
  View,
  type GestureResponderEvent,
} from "react-native";
import { Portal } from "@rn-primitives/portal";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  SharedValue,
  Easing,
} from "react-native-reanimated";
import { cn } from "../../libs/utils";
import { Draggable } from "./draggable";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_DURATION = 300;

type DrawerContextValue = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAnimating: boolean;
  animations: {
    translateY: SharedValue<number>;
    overlayOpacity: SharedValue<number>;
  };
};

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);
const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("drawer components must be used within a Drawer");
  }
  return context;
};

const Drawer = ({
  defaultOpen = false,
  open,
  onOpenChange,
  children,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (isAnimating) return;
      setIsAnimating(true);

      if (open) {
        if (onOpenChange) onOpenChange(open);
        if (!onOpenChange) setIsOpen(open);

        overlayOpacity.value = withTiming(0.5, {
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
        });

        translateY.value = withTiming(
          0,
          { duration: ANIMATION_DURATION, easing: Easing.out(Easing.cubic) },
          () => {
            runOnJS(setIsAnimating)(false);
          }
        );
      } else {
        overlayOpacity.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
        });

        translateY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: ANIMATION_DURATION, easing: Easing.in(Easing.cubic) },
          () => {
            if (onOpenChange) runOnJS(onOpenChange)(open);
            if (!onOpenChange) runOnJS(setIsOpen)(open);

            runOnJS(setIsAnimating)(false);
          }
        );
      }
    },
    [onOpenChange, isAnimating, overlayOpacity, translateY]
  );

  // TODO: Remove/change this - quick hack to get custom open state passed through props working
  React.useEffect(() => {
    if (open !== undefined) {
      handleOpenChange(open);
    }
  }, [open]);

  return (
    <DrawerContext.Provider
      value={{
        isOpen: open !== undefined ? open : isOpen,
        onOpenChange: handleOpenChange,
        isAnimating,
        animations: {
          translateY,
          overlayOpacity,
        },
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = ({
  children,
  onPress,
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const { onOpenChange, isOpen } = useDrawerContext();

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;
    onOpenChange(!isOpen);
    onPress?.(event);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(disabled && "opacity-50", className)}
    >
      {children}
    </Pressable>
  );
};

const DrawerPortal = ({
  children,
  hostName,
}: {
  children: React.ReactNode;
  hostName?: string;
}) => {
  const context = useDrawerContext();

  // Show portal when open OR when animating (for close animation)
  if (!context.isOpen && !context.isAnimating) return null;

  return (
    <Portal hostName={hostName} name="drawer_portal">
      <DrawerContext.Provider value={context}>
        {children}
      </DrawerContext.Provider>
    </Portal>
  );
};

const DrawerOverlay = ({
  className,
  onPress,
}: {
  className?: string;
  onPress?: (event: GestureResponderEvent) => void;
}) => {
  const { onOpenChange, animations } = useDrawerContext();

  const handlePress = (event: GestureResponderEvent) => {
    onOpenChange(false);
    onPress?.(event);
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: animations.overlayOpacity.value };
  }, []);

  return (
    <Pressable
      className={cn("absolute inset-0", className)}
      onPress={handlePress}
    >
      <Reanimated.View
        className="flex-1 bg-black"
        style={overlayAnimatedStyle}
      />
    </Pressable>
  );
};

const DrawerContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { animations, onOpenChange } = useDrawerContext();

  // To support Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onOpenChange(false);
        return true;
      }
    );
    return () => backHandler.remove();
  }, [onOpenChange]);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: animations.translateY.value }] };
  }, []);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <View className="absolute inset-x-0 bottom-0 justify-end">
        <Draggable
          axis="y"
          onDragEnd={(event) => {
            if (event.thresholdReached && event.direction === "down") {
              onOpenChange(false);
            }
          }}
        >
          <Reanimated.View
            style={animatedStyle}
            className={cn(
              "bg-[#222126] rounded-t-[32px] relative border border-[#2d2c32]",
              className
            )}
          >
            <View className="w-24 h-1 bg-white rounded-full self-center absolute top-3 " />
            <View className={cn("py-12 px-6 flex-1", className)}>
              {children}
            </View>
            <View
              style={{
                height: SCREEN_HEIGHT,
                bottom: -SCREEN_HEIGHT + 1,
              }}
              className="bg-[#222126] w-full absolute"
            />
          </Reanimated.View>
        </Draggable>
      </View>
    </DrawerPortal>
  );
};

export { Drawer, DrawerTrigger, DrawerContent };
