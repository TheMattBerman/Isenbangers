import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

type Props = { visible: boolean; onClose: () => void };

export default function UnlockMoreModal({ visible, onClose }: Props) {
  const nav = useNavigation<any>();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 16 }}>
          <View className="flex-row items-center justify-between p-6" style={{ borderBottomWidth: 1, borderColor: "#E6E3DA" }}>
            <Text className="text-lg font-semibold" style={{ color: "#111111" }}>Unlock more</Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View className="px-6 pt-5">
            <Text style={{ color: "#374151", fontSize: 14, lineHeight: 20 }}>
              More bangers and the full library are coming soon. Get a taste in the Library now.
            </Text>
          </View>

          <View className="px-6 pt-5 gap-3">
            <Pressable
              onPress={() => { onClose(); nav.navigate("Library"); }}
              className="h-12 rounded-full overflow-hidden items-center justify-center"
              style={{ borderWidth: 1, borderColor: "#FFD3B0" }}
            >
              <LinearGradient colors={["#FF8C33", "#FF7A1A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", inset: 0, borderRadius: 999 }} />
              <Text className="font-semibold" style={{ color: "#FFFFFF" }}>Explore Library</Text>
            </Pressable>

            <Pressable onPress={onClose} className="h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
              <Text className="font-semibold" style={{ color: "#374151" }}>Not now</Text>
            </Pressable>
          </View>

          <View style={{ height: 16 }} />
        </View>
      </View>
    </Modal>
  );
}
