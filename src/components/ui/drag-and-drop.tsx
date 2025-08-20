import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { View, ViewProps } from "react-native";
import { FreeDrag, FreeDragProps } from "./free-drag";
import * as Haptics from "expo-haptics";

type DragAndDropContextType = {
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  canDrop: boolean;
  setCanDrop: (canDrop: boolean) => void;
  dropRef: React.RefObject<View | null>;
  dropLayoutRef: React.RefObject<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
};

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(
  undefined
);

const useDragAndDropContext = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error(
      "drag-and-drop components must be used within a DragAndDrop"
    );
  }
  return context;
};

const useDragAndDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  const dropRef = useRef<View>(null);
  const dropLayoutRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  return {
    isDragging,
    setIsDragging,
    canDrop,
    setCanDrop,
    dropRef,
    dropLayoutRef,
  };
};

type DragAndDropProps = {
  children: React.ReactNode;
  instance?: ReturnType<typeof useDragAndDrop>;
};
const DragAndDrop = ({ children, instance }: DragAndDropProps) => {
  const value = instance ?? useDragAndDrop();

  return (
    <DragAndDropContext.Provider value={{ ...value }}>
      {children}
    </DragAndDropContext.Provider>
  );
};

type DragProps = FreeDragProps & {
  onDrop: () => void;
  onCanDrop?: (canDrop: boolean) => void;
};
const Drag = ({
  onDrop,
  onCanDrop,
  onDragStart,
  onDragEnd,
  onDragMove,
  ...props
}: DragProps) => {
  const { dropRef, dropLayoutRef, setIsDragging, canDrop, setCanDrop } =
    useDragAndDropContext();

  const handleDragMove = useCallback(
    (absX: number, absY: number) => {
      const bounds = dropLayoutRef.current;
      if (!bounds) return;

      const withinX = absX >= bounds.x && absX <= bounds.x + bounds.width;
      const withinY = absY >= bounds.y && absY <= bounds.y + bounds.height;
      const nowOver = withinX && withinY;
      if (nowOver !== canDrop) {
        if (nowOver) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        setCanDrop(nowOver);
        if (onCanDrop) onCanDrop?.(nowOver);
      }
    },
    [canDrop]
  );

  return (
    <FreeDrag
      onDragStart={() => {
        setIsDragging(true);
        // Defer to the next frame to ensure layout is ready, then measure
        requestAnimationFrame(() => {
          dropRef.current?.measureInWindow?.((x, y, width, height) => {
            dropLayoutRef.current = { x, y, width, height };
          });
        });

        if (onDragStart) onDragStart();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        if (canDrop) {
          onDrop();
        }

        if (onDragEnd) onDragEnd();
      }}
      onDragMove={(x, y) => {
        handleDragMove(x, y);
        if (onDragMove) onDragMove(x, y);
      }}
      {...props}
    />
  );
};

type DropProps = ViewProps;
const Drop = (
  props: DropProps & {
    forceMount?: boolean;
  }
) => {
  const { dropRef, dropLayoutRef, isDragging } = useDragAndDropContext();

  if (!isDragging && !props.forceMount) return null;

  return (
    <View
      ref={dropRef}
      onLayout={() => {
        // Measure in window coordinates to match gesture absoluteX/absoluteY
        dropRef.current?.measureInWindow?.((x, y, width, height) => {
          dropLayoutRef.current = { x, y, width, height };
        });
      }}
      {...props}
    />
  );
};

export {
  DragAndDrop,
  Drag,
  Drop,
  useDragAndDrop,
  type DragAndDropProps,
  type DragProps,
  type DropProps,
};
