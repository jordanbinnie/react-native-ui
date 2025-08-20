import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  NavigationProp,
  NavigatorTypeBagBase,
  ParamListBase,
  StaticConfig,
  TabActionHelpers,
  TabNavigationState,
  TabRouter,
  TabRouterOptions,
  TypedNavigator,
  useNavigationBuilder,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { CrossfadeTabNavigator } from "./crossfade-tab-navigator";

// Supported screen options
type TabNavigationOptions = {
  title?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

export type TabNavigationEventMap = {
  /**
   * Event which fires on tapping on the tab in the tab bar.
   */
  tabPress: { data: undefined; canPreventDefault: true };
  /**
   * Event which fires on long press on the tab in the tab bar.
   */
  tabLongPress: { data: undefined };
  /**
   * Event which fires when a transition animation starts.
   */
  transitionStart: { data: undefined };
  /**
   * Event which fires when a transition animation ends.
   */
  transitionEnd: { data: undefined };
};

type TabNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  TabNavigationState<ParamList>,
  TabNavigationOptions,
  TabNavigationEventMap
> &
  TabActionHelpers<ParamList>;

type Props = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  TabNavigationOptions,
  TabNavigationEventMap,
  TabNavigationProp<ParamListBase>
> &
  TabRouterOptions;

const useNavBuilder = (props: Props) =>
  useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    TabNavigationOptions,
    TabNavigationEventMap
  >(TabRouter, props);
export type NavigationBuilder = ReturnType<typeof useNavBuilder>;

export function CrossfadeNavigator(props: Props) {
  const navigationBuilder = useNavBuilder(props);

  return (
    <navigationBuilder.NavigationContent>
      <CrossfadeTabNavigator navigationBuilder={navigationBuilder} />
    </navigationBuilder.NavigationContent>
  );
}

export function createCrossfadeNavigator<
  const ParamList extends ParamListBase,
  const NavigatorID extends string | undefined = undefined,
  const TypeBag extends NavigatorTypeBagBase = {
    ParamList: ParamList;
    NavigatorID: NavigatorID;
    State: TabNavigationState<ParamList>;
    ScreenOptions: TabNavigationOptions;
    EventMap: TabNavigationEventMap;
    NavigationList: {
      [RouteName in keyof ParamList]: TabNavigationProp<
        ParamList,
        RouteName,
        NavigatorID
      >;
    };
    Navigator: typeof CrossfadeNavigator;
  },
  const Config extends StaticConfig<TypeBag> = StaticConfig<TypeBag>,
>(config?: Config): TypedNavigator<TypeBag, Config> {
  return createNavigatorFactory(CrossfadeNavigator)(config);
}
