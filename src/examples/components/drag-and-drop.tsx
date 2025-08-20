import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import Reanimated, {
  interpolateColor,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Drag, DragAndDrop, Drop } from "../../components/ui/drag-and-drop";
import { Drawer, DrawerContent } from "../../components/ui/drawer";

const ANIMATION_DURATION = 200;
const AnimatedIonicons = Reanimated.createAnimatedComponent(Ionicons);

export const ExampleDragAndDrop = () => {
  const [openDeleteWorkoutDrawer, setOpenDeleteWorkoutDrawer] = useState(false);
  const [forceMountDrop, setForceMountDrop] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);

  // Track the absolute screen bounds of the trash target
  const trashLayoutRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const trashRef = useRef<View>(null);

  const handleDragMove = useCallback(
    (absX: number, absY: number) => {
      const bounds = trashLayoutRef.current;
      if (!bounds) return;

      const withinX = absX >= bounds.x && absX <= bounds.x + bounds.width;
      const withinY = absY >= bounds.y && absY <= bounds.y + bounds.height;
      const nowOver = withinX && withinY;
      if (nowOver !== isOverTrash) setIsOverTrash(nowOver);
    },
    [isOverTrash]
  );

  // TODO: replace this animation config with cn() from utils.ts + nativewind transition-*
  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  const translateX = useSharedValue(-60);
  const translateXStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#000000", "#ffffff"]
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#2f2e34", "#ffffff"]
      ),
    };
  });
  const iconStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(progress.value, [0, 1], ["#ffffff", "#000000"]),
    };
  });

  return (
    <>
      <DragAndDrop>
        <View className="relative flex-1">
          <Drop
            className="absolute top-60 z-10 left-0"
            forceMount={forceMountDrop}
          >
            <Reanimated.View
              style={translateXStyle}
              className="flex flex-row gap-2 items-center"
            >
              <Reanimated.View
                style={progressStyle}
                className="border-[1.5px] text-red-400 border-[#2f2e34] bg-black rounded-full h-12 w-12 flex items-center justify-center"
              >
                <AnimatedIonicons style={iconStyle} name="trash" size={20} />
              </Reanimated.View>
              <Reanimated.Text
                style={opacityStyle}
                className="text-white text-xl font-bold p-2 bg-black rounded-xl absolute left-14"
              >
                Delete
              </Reanimated.Text>
            </Reanimated.View>
          </Drop>
          <FlatList
            data={[
              { id: "example-1" },
              { id: "example-2" },
              { id: "example-3" },
              { id: "example-4" },
            ]}
            scrollEnabled={false}
            numColumns={2}
            renderItem={({ item }) => {
              return (
                <Drag
                  layout={LinearTransition.springify()
                    .mass(0.5)
                    .damping(15)
                    .duration(500)}
                  onCanDrop={(canDrop) => {
                    opacity.value = withTiming(canDrop ? 1 : 0, {
                      duration: ANIMATION_DURATION,
                    });
                    translateX.value = withTiming(canDrop ? 30 : 0, {
                      duration: ANIMATION_DURATION,
                    });
                    progress.value = withTiming(canDrop ? 1 : 0, {
                      duration: ANIMATION_DURATION,
                    });
                  }}
                  onDrop={() => {
                    opacity.value = withTiming(0, {
                      duration: ANIMATION_DURATION,
                    });
                    progress.value = withTiming(0, {
                      duration: ANIMATION_DURATION,
                    });

                    setOpenDeleteWorkoutDrawer(true);
                  }}
                  onDragStart={() => {
                    setForceMountDrop(true);
                    // Defer to the next frame to ensure layout is ready, then measure
                    requestAnimationFrame(() => {
                      trashRef.current?.measureInWindow?.(
                        (x, y, width, height) => {
                          trashLayoutRef.current = { x, y, width, height };
                        }
                      );
                    });

                    translateX.value = withTiming(0, {
                      duration: ANIMATION_DURATION,
                    });
                  }}
                  onDragEnd={() => {
                    translateX.value = withTiming(
                      -60,
                      {
                        duration: ANIMATION_DURATION,
                      },
                      () => {
                        runOnJS(setForceMountDrop)(false);
                      }
                    );
                  }}
                  onDragMove={handleDragMove}
                  className="flex-1 flex aspect-square flex-col items-center justify-center custom-[state=inactive]:active:bg-[#2f2e34] custom-[state=active]:border-[#3c3b3f] custom-[state=active]:z-50 custom-[state=idle]:z-50 rounded-3xl bg-[#151619] border-[1.5px] border-[#2e2e34]"
                >
                  <Text className="text-white font-bold">Drag and Drop</Text>
                </Drag>
              );
            }}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={{ gap: 16 }}
            contentContainerStyle={{ gap: 16 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </DragAndDrop>

      <Drawer
        open={openDeleteWorkoutDrawer}
        onOpenChange={setOpenDeleteWorkoutDrawer}
      >
        <DrawerContent className="flex flex-col gap-8">
          <View className="flex flex-col gap-2">
            <Text className="text-3xl font-bold text-white">
              Delete "Shoulder & Abs"
            </Text>
            <Text className="text-white/85 text-[13px] leading-5">
              Exercises within this workout and their progress will be left
              unaffected. Nothing that you've tracked will be lost.
            </Text>
          </View>
          <View className="flex flex-col gap-6">
            <Pressable
              onPress={() => {
                setOpenDeleteWorkoutDrawer(false);
              }}
              className="border-[#622229] border-2 bg-[#dd2330] rounded-2xl p-3"
            >
              <Text className="font-semibold text-white text-xl text-center">
                Delete
              </Text>
            </Pressable>
          </View>
        </DrawerContent>
      </Drawer>
    </>
  );
};
