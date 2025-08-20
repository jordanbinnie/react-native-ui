import React, { useRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Overlay,
  usePopover,
  useRootContext,
} from "../primitives/popover";
import { Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";

const ANIMATION_DURATION = 150;

// TODO: refactor this to use reanimated
export const Popover = (props: React.ComponentProps<typeof Root>) => {
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const overlayFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const poppover = usePopover();
  const onOpenChange = (value: boolean) => {
    if (value) {
      poppover.setOpen(value);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.timing(overlayFadeAnim, {
          toValue: 0.25,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {});
    } else {
      Animated.parallel([
        Animated.timing(overlayFadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        poppover.setOpen(value);
      });
    }
  };

  return (
    <Root
      context={{
        ...poppover,
        onOpenChange,
        animations: {
          scaleAnim,
          overlayFadeAnim,
        },
      }}
      {...props}
    />
  );
};

export const PopoverTrigger = (props: React.ComponentProps<typeof Trigger>) => {
  return <Trigger {...props} />;
};

export const PopoverContent = ({
  transformOrigin = "top right",
  children,
  ...props
}: React.ComponentProps<typeof Content> & {
  transformOrigin?: "top right" | "top left" | "bottom right" | "bottom left";
}) => {
  const { animations } = useRootContext();

  return (
    <Portal>
      <Overlay className="absolute inset-0">
        <Animated.View
          style={{ opacity: animations?.overlayFadeAnim ?? 1 }}
          className="w-full h-full bg-black"
        />
      </Overlay>
      <Content align="end" sideOffset={20} {...props}>
        <Animated.View
          className="bg-[#2e2e33] rounded-2xl border border-[#3e3e42]"
          style={{
            transform: [
              { scaleX: animations?.scaleAnim ?? 1 },
              { scaleY: animations?.scaleAnim ?? 1 },
            ],
            transformOrigin,
          }}
        >
          {children}
        </Animated.View>
      </Content>
    </Portal>
  );
};
