import { Pressable, ScrollView, Text, View } from "react-native";
import { ExampleDragAndDrop } from "../../examples/components/drag-and-drop";
import { ExamplePopover } from "../components/popover";
import { NativeDrawer } from "../../components/ui/native-drawer";
import { ExampleScrollSelect } from "../components/scroll-select";
import { useState } from "react";
import { ExampleDrawer } from "../components/drawer";

export default function HomeScreen() {
  const [openScrollSelectDrawer, setOpenScrollSelectDrawer] = useState(false);

  return (
    <View className="flex-1 bg-[rgb(10,10,13)] px-4 flex gap-8">
      <Text className="text-[36px] font-bold text-white">Examples</Text>
      <ScrollView className="flex-1">
        <View className="flex flex-col gap-8 flex-1">
          <ExamplePopover />
          <ExampleDrawer />

          <Pressable
            className="bg-[#2e2e33] rounded-2xl"
            onPress={() => {
              setOpenScrollSelectDrawer(true);
            }}
          >
            <Text className="p-4 text-white font-semibold text-center">
              Scroll Select
            </Text>
          </Pressable>
          <NativeDrawer
            open={openScrollSelectDrawer}
            setOpen={setOpenScrollSelectDrawer}
          >
            <ExampleScrollSelect />
          </NativeDrawer>

          <ExampleDragAndDrop />
        </View>
      </ScrollView>
    </View>
  );
}
