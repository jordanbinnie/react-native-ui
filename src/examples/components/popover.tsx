import { Pressable, Text, View } from "react-native";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Ionicons } from "@expo/vector-icons";

export const ExamplePopover = () => {
  return (
    <Popover>
      <PopoverTrigger className="bg-[#2e2e33] rounded-2xl">
        <Text className="p-4 text-white font-semibold text-center">
          Popover
        </Text>
      </PopoverTrigger>
      <PopoverContent>
        <View className="flex flex-col">
          <Pressable className="flex flex-row items-center p-4 gap-3 pr-20">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold">Create workout</Text>
          </Pressable>
          <View className="h-px bg-[#3e3e42] mx-4" />
          <Pressable className="flex flex-row items-center p-4 gap-3 pr-20">
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold">Add exercise</Text>
          </Pressable>
        </View>
      </PopoverContent>
    </Popover>
  );
};
