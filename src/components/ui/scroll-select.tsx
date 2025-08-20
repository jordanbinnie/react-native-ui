import React, { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  PressableProps,
  ScrollView,
  ScrollViewProps,
  View,
  ViewProps,
} from "react-native";
import * as Slot from "@rn-primitives/slot";
import { PressableRef } from "@rn-primitives/types";
import * as Haptics from "expo-haptics";
import { cn } from "../../libs/utils";

type ScrollSelectContextValue = {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  itemHeight: number;
  paddingY: number;
  onSubmit: (index: number) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
  scrollToIndex: (index: number) => void;
}

const ScrollSelectContext = React.createContext<ScrollSelectContextValue | undefined>(undefined);

function useScrollSelectContext() {
  const context = React.useContext(ScrollSelectContext);
  if (!context) {
    throw new Error(
      "scroll-select components must be used within a ScrollSelect"
    );
  }
  return context;
}

function useScrollSelect(props: {
  itemHeight: number;
  paddingY?: number;
  onSubmit: (index: number) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      y: (index + 1) * props.itemHeight,
      animated: true,
    });
  };

  return {
    selectedIndex,
    setSelectedIndex,
    scrollViewRef,
    scrollToIndex,
    ...props,
  };
}

const ScrollSelect = React.forwardRef<
  View,
  ViewProps & {
    asChild?: boolean;
    context: ReturnType<typeof useScrollSelect>;
  }
>(({ asChild, className, context, ...props }, ref) => {
  const {
    selectedIndex,
    setSelectedIndex,
    itemHeight,
    paddingY = 0,
    onSubmit,
    scrollViewRef,
    scrollToIndex,
  } = context;

  const Component = asChild ? Slot.View : View;

  return (
    <ScrollSelectContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        itemHeight,
        paddingY,
        onSubmit,
        scrollViewRef,
        scrollToIndex,
      }}
    >
      <Component ref={ref} className={cn("relative", className)} {...props} />
    </ScrollSelectContext.Provider>
  );
});

const ScrollSelectContent = React.forwardRef<ScrollView, ScrollViewProps>(
  (props, ref) => {
    const {
      selectedIndex,
      setSelectedIndex,
      itemHeight,
      paddingY,
      scrollViewRef,
    } = useScrollSelectContext();

    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const handleLayout = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setScrollViewHeight(height);
    };

    const handleScroll = (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const currentIndex = Math.round(y / itemHeight) - 1;
      const children = React.Children.toArray(props.children).length;

      // Only trigger when we cross over to a new snap interval
      if (currentIndex !== selectedIndex && currentIndex < children) {
        if (currentIndex >= 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedIndex(currentIndex);
        } else {
          setSelectedIndex(-1);
        }
      }
    };

    return (
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onLayout={handleLayout}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingTop: paddingY + itemHeight,
          paddingBottom: scrollViewHeight - itemHeight - paddingY,
        }}
        style={{ zIndex: 3 }}
        {...props}
      />
    );
  }
);

const ScrollSelectItem = React.forwardRef<
  PressableRef,
  PressableProps & { asChild?: boolean; index: number }
>(({ asChild, onPress, index, ...props }, ref) => {
  const { itemHeight, scrollToIndex } = useScrollSelectContext();

  const Component = asChild ? Slot.Pressable : Pressable;
  return (
    <Component
      ref={ref}
      style={{ height: itemHeight }}
      onPress={(event) => {
        scrollToIndex(index);
        onPress?.(event);
      }}
      {...props}
    />
  );
});

const ScrollSelectTriggerWrapper = React.forwardRef<View, ViewProps>(
  (props, ref) => {
    const { itemHeight, paddingY } = useScrollSelectContext();
    return (
      <View
        ref={ref}
        style={{ height: itemHeight, top: paddingY, zIndex: 5 }}
        {...props}
      />
    );
  }
);

const ScrollSelectTrigger = React.forwardRef<
  PressableRef,
  PressableProps & { asChild?: boolean }
>(({ asChild, ...props }, ref) => {
  const { selectedIndex, onSubmit } = useScrollSelectContext();

  const Component = asChild ? Slot.Pressable : Pressable;
  return (
    <Component ref={ref} {...props} onPress={() => onSubmit(selectedIndex)} />
  );
});

export {
  ScrollSelect,
  ScrollSelectContent,
  ScrollSelectItem,
  ScrollSelectTriggerWrapper,
  ScrollSelectTrigger,
  useScrollSelect,
};
