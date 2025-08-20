import "./global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createCrossfadeNavigator } from "./src/components/navigation/crossfade-navigator";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";

const { Navigator, Screen } = createCrossfadeNavigator();

export default function App() {
  return (
    <>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <NavigationContainer>
            <Navigator>
              <Screen
                name="Home"
                getComponent={() =>
                  require("./src/examples/screens/index").default
                }
                options={{
                  icon: "grid-outline",
                }}
              />
              <Screen
                name="Workouts"
                getComponent={() =>
                  require("./src/examples/screens/workouts").default
                }
                options={{
                  icon: "barbell-outline",
                }}
              />
            </Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
        <PortalHost />
      </GestureHandlerRootView>
      <StatusBar style="light" />
    </>
  );
}
