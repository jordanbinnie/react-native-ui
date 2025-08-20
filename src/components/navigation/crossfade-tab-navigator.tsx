import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationBuilder } from "./crossfade-navigator";
import {
  NavigationRoute,
  ParamListBase,
  TabActions,
} from "@react-navigation/native";

// TODO: refactor this to use reanimated

interface CrossfadeTabNavigatorProps {
  transitionDuration?: number;
  navigationBuilder: NavigationBuilder;

  // Lazy loading options
  lazy?: boolean;
  lazyPlaceholder?: React.ComponentType;
  detachInactiveScreens?: boolean;
}

export const CrossfadeTabNavigator = ({
  transitionDuration = 150,
  navigationBuilder,
  lazy = true,
  lazyPlaceholder: LazyPlaceholder,
  detachInactiveScreens = false,
}: CrossfadeTabNavigatorProps) => {
  const { state, navigation, descriptors } = navigationBuilder;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [loadedScreens, setLoadedScreens] = useState<Set<number>>(() => {
    return new Set([state.index]);
  });

  const { fadeAnims, iconFadeAnims } = useMemo(() => {
    const fadeAnims = state.routes.map(
      (_, index) => new Animated.Value(index === state.index ? 1 : 0)
    );

    const iconFadeAnims = state.routes.map(
      (_, index) => new Animated.Value(index === state.index ? 1 : 0.5)
    );

    return { fadeAnims, iconFadeAnims };
  }, []);

  /**
   * @description
   * We need to declare this as state to force a re-render.
   * zIndex's in React Native require a layout recalculation -
   * it doesn't work the same as purely visual properties like opacity.
   */
  const [zIndexAnims, setZIndexAnims] = useState(
    state.routes.map((_, index) => (index === state.index ? 1 : 0))
  );

  const switchTab = (oldIndex: number, targetIndex: number) => {
    navigation.emit({
      type: "tabPress",
      target: state.routes[targetIndex].key,
      canPreventDefault: true,
    });

    // If the tab is already active, do nothing
    if (targetIndex === state.index) return;

    // Mark the target screen as loaded if lazy loading is enabled
    if (lazy) {
      setLoadedScreens((prev) => new Set([...prev, targetIndex]));
    }

    // Navigate to the new tab
    navigation.dispatch({
      ...TabActions.jumpTo(
        state.routes[targetIndex].name,
        state.routes[targetIndex].params
      ),
      target: state.key,
    });

    // Stop any ongoing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const animation = Animated.parallel([
      ...state.routes.map((route, index) => {
        if (index === targetIndex) {
          // Fade in the new screen
          return Animated.timing(fadeAnims[index], {
            toValue: 1,
            duration: !!animationRef.current ? transitionDuration : 0,
            useNativeDriver: true,
          });
        }

        // Fade out the old screen &
        // all other inactive screens - incase animations were paused mid-way.
        return Animated.timing(fadeAnims[index], {
          toValue: 0,
          duration: transitionDuration,
          useNativeDriver: true,
        });
      }),

      ...state.routes.map((route, index) => {
        return Animated.timing(iconFadeAnims[index], {
          toValue: index === targetIndex ? 1 : 0.5,
          duration: transitionDuration,
          useNativeDriver: true,
        });
      }),
    ]);

    animationRef.current = animation;

    // Ensure all inactive screens zIndex's are reset to 0
    let newZIndexAnims = [...zIndexAnims];
    newZIndexAnims.forEach((anim, index) => {
      if (index !== oldIndex && index !== targetIndex) {
        newZIndexAnims[index] = 0;
      }
    });
    setZIndexAnims(newZIndexAnims);

    animation.start(({ finished }) => {
      if (finished) {
        setZIndexAnims((prev) => {
          const newZIndexAnims = [...prev];
          newZIndexAnims[oldIndex] = 0;
          newZIndexAnims[targetIndex] = 1;
          return newZIndexAnims;
        });

        // Clear the ref when animation completes
        animationRef.current = null;
      }
    });
  };

  const shouldRenderScreen = (index: number) => {
    if (!lazy) return true;

    if (detachInactiveScreens) {
      // Only render the active screen
      return index === state.index;
    } else {
      // Render if loaded (lazy loading)
      return loadedScreens.has(index);
    }
  };

  const renderScreenContent = (
    route: NavigationRoute<ParamListBase, string>,
    index: number
  ) => {
    if (!shouldRenderScreen(index)) {
      return LazyPlaceholder ? <LazyPlaceholder /> : null;
    }

    return descriptors[route.key].render();
  };

  useEffect(() => {
    // Cleanup animation when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0d]">
      {/* Tab Screens with Overlapping Crossfade */}
      <View className="relative flex-1">
        {state.routes.map((route, index) => (
          <Animated.View
            key={route.name}
            className="absolute inset-0"
            style={{
              opacity: fadeAnims[index],
              zIndex: zIndexAnims[index],
            }}
          >
            {renderScreenContent(route, index)}
          </Animated.View>
        ))}
      </View>

      {/* Tab Bar with Animated Icons */}
      <View className="flex flex-row items-center justify-around pb-4">
        {state.routes.map((route, index) => {
          return (
            <Pressable
              key={route.name}
              className="flex-1 items-center justify-center py-2"
              onPress={() => switchTab(state.index, index)}
            >
              <Animated.View
                style={{
                  opacity: iconFadeAnims[index],
                }}
              >
                <Ionicons
                  name={descriptors[route.key].options.icon}
                  size={24}
                  color="#FFFFFF"
                />
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
