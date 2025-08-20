import { Modal, View } from "react-native";

export const NativeDrawer = ({
  open,
  setOpen,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={open}
      onRequestClose={() => setOpen(false)}
      backdropColor="#0a0a0d"
    >
      <View className="flex-1 bg-[#0a0a0d] rounded-t-[32px] relative">
        <View className="bg-white h-1 w-24 absolute top-2.5 left-1/2 -translate-x-1/2 rounded-full" />
        <View className="flex-1">{children}</View>
      </View>
    </Modal>
  );
};
