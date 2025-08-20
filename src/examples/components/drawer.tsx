import { Pressable, Text, View } from "react-native";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../../components/ui/drawer";

export const ExampleDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger className="bg-[#2e2e33] rounded-2xl">
        <Text className="p-4 text-white font-semibold text-center">Drawer</Text>
      </DrawerTrigger>
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
          <Pressable className="border-[#622229] border-2 bg-[#dd2330] rounded-2xl p-3">
            <Text className="font-semibold text-white text-xl text-center">
              Delete
            </Text>
          </Pressable>
        </View>
      </DrawerContent>
    </Drawer>
  );
};
