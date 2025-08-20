// Extended from https://github.com/roninoss/rn-primitives/blob/main/packages/popover/src/types.ts

import { usePopover } from "./index";
import type {
  ForceMountable,
  PositionedContentProps,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from "@rn-primitives/types";
import { Animated } from "react-native";

type RootProps = SlottableViewProps & {
  onOpenChange?: (open: boolean) => void;
  context?: ReturnType<typeof usePopover>;
  animations?: {
    scaleAnim: Animated.Value;
    overlayFadeAnim: Animated.Value;
  };
};
interface PortalProps extends ForceMountable {
  children: React.ReactNode;
  /**
   * Platform: NATIVE ONLY
   */
  hostName?: string;
  /**
   * Platform: WEB ONLY
   */
  container?: HTMLElement | null | undefined;
}

type OverlayProps = ForceMountable &
  SlottablePressableProps & {
    closeOnPress?: boolean;
  };

type TriggerProps = SlottablePressableProps;
type ContentProps = SlottableViewProps &
  PositionedContentProps & {
    /**
     * Platform: WEB ONLY
     */
    onOpenAutoFocus?: (event: Event) => void;
  };
type CloseProps = SlottablePressableProps;

type CloseRef = PressableRef;
type ContentRef = ViewRef;
type OverlayRef = PressableRef;
type RootRef = ViewRef;
type TriggerRef = PressableRef & {
  open: () => void;
  close: () => void;
};

export type {
  CloseProps,
  CloseRef,
  ContentProps,
  ContentRef,
  OverlayProps,
  OverlayRef,
  PortalProps,
  RootProps,
  RootRef,
  TriggerProps,
  TriggerRef,
};
