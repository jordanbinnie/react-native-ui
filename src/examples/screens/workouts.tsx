import { Text, View } from "react-native";

export default function WorkoutsScreen() {
  return (
    <View className="flex-1 bg-[rgb(10,10,13)] flex gap-8 px-4">
      <Text className="text-[36px] font-bold text-white">Workouts</Text>

      <View className="flex-1 flex flex-col justify-center items-center">
        <Text className="text-white">This is an example screen</Text>
      </View>
    </View>
  );
}
