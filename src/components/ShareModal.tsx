import React, { useRef } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Banger } from "../types/banger";
import { shareAsText, shareAsImage } from "../utils/sharing";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  banger: Banger;
}

export default function ShareModal({ visible, onClose, banger }: ShareModalProps) {
  const cardRef = useRef(null);

  const handleShareText = async () => {
    await shareAsText(banger);
    onClose();
  };

  const handleShareImage = async () => {
    if (cardRef.current) {
      await shareAsImage(cardRef.current);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="rounded-t-3xl" style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: "#E6E3DA" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-6" style={{ borderBottomWidth: 1, borderColor: "#E6E3DA" }}>
            <Text className="text-xl font-bold" style={{ color: "#111111" }}>
              Share this Banger
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Preview Card */}
          <View className="p-6">
            <View ref={cardRef} style={{ borderRadius: 20, padding: 16, overflow: "hidden" }}>
              <LinearGradient
                colors={["#FF8C33", "#FF7A1A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 16 }}
              >
              <Text className="text-white text-lg font-medium leading-relaxed mb-4">
                "{banger.text}"
              </Text>
              <Text className="text-orange-100 text-right italic">
                — Greg Isenberg
              </Text>
              <View className="mt-4 pt-4 border-t border-orange-300">
                <Text className="text-orange-100 text-center text-sm">
                  Isenbangers 🚀
                </Text>
              </View>
              </LinearGradient>
            </View>
          </View>
          
           {/* Share Options */}
          <View className="px-6 pb-8">
            <View className="space-y-3">
              <Pressable
                onPress={handleShareText}
                className="flex-row items-center bg-blue-500 rounded-xl p-4"
              >
                <Ionicons name="copy-outline" size={24} color="white" />
                <Text className="text-white font-semibold ml-3 text-lg">
                  Copy as Text
                </Text>
              </Pressable>

              <Pressable
                onPress={handleShareImage}
                className="flex-row items-center bg-green-500 rounded-xl p-4"
              >
                <Ionicons name="image-outline" size={24} color="white" />
                <Text className="text-white font-semibold ml-3 text-lg">
                  Share as Image
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}