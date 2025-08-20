import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../../libs/utils";
import {
  ScrollSelectContent,
  ScrollSelectItem,
  ScrollSelect,
  ScrollSelectTrigger,
  ScrollSelectTriggerWrapper,
  useScrollSelect,
} from "../../components/ui/scroll-select";

const OPTIONS = [
  "Custom",
  "Push",
  "Pull",
  "Full body",
  "Upper body",
  "Lower body",
  "Core",
  "Cardio",
  "Rest day",
] as const;

export const ExampleScrollSelect = () => {
  const scrollSelectContext = useScrollSelect({
    itemHeight: 63,
    paddingY: 100,
    onSubmit: () => {},
  });

  return (
    <View className="flex-1 relative">
      <View className="w-full h-28 flex items-start justify-center px-4">
        <Ionicons name="arrow-down" size={28} color="white" />
      </View>

      <ScrollSelect className="px-4 flex-1" context={scrollSelectContext}>
        <ScrollSelectTriggerWrapper className="border-y border-white/10 flex flex-row justify-end items-center absolute mx-4 w-full">
          <ScrollSelectTrigger
            className={cn(
              "flex items-center justify-center bg-white/60 rounded-full p-2",
              {
                "bg-white": scrollSelectContext.selectedIndex >= 0,
              }
            )}
          >
            <Ionicons name="arrow-forward" size={24} color="#0a0a0d" />
          </ScrollSelectTrigger>
        </ScrollSelectTriggerWrapper>

        <ScrollSelectContent>
          {OPTIONS.map((option, index) => {
            return (
              <ScrollSelectItem
                key={option}
                index={index}
                className="py-4 px-2"
              >
                <Text
                  className={cn("text-white/60 text-4xl font-bold", {
                    "text-white": index === scrollSelectContext.selectedIndex,
                  })}
                >
                  {option}
                </Text>
              </ScrollSelectItem>
            );
          })}
        </ScrollSelectContent>
      </ScrollSelect>

      <View className="border-t border-white/10 absolute bottom-20 w-full left-0 h-28 bg-[#0a0a0d] z-10">
        <View className="p-4 flex flex-col gap-1">
          <Text className="font-bold">
            {OPTIONS[scrollSelectContext.selectedIndex] ? (
              <Text className="text-white/60">
                Create a{" "}
                <Text className="text-white">
                  {OPTIONS[scrollSelectContext.selectedIndex]}
                </Text>{" "}
                workout
              </Text>
            ) : (
              <Text className="text-white">Create a workout</Text>
            )}
          </Text>
          <Text className="text-sm text-white/60">
            We'll help you pick excercises later
          </Text>
        </View>
      </View>
    </View>
  );
};
