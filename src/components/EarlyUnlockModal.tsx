import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../state/appStore";

type Props = { 
  visible: boolean; 
  onClose: () => void; 
  onUnlock: () => void;
  timeRemaining: string;
};

export default function EarlyUnlockModal({ visible, onClose, onUnlock, timeRemaining }: Props) {
  const { spins, canAffordEarlyUnlock, spendSpins } = useAppStore();
  const unlockCost = 2;
  const canAfford = canAffordEarlyUnlock();

  const handleUnlock = () => {
    if (canAfford && spendSpins(unlockCost)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlock();
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center px-6">
        <View style={{ 
          backgroundColor: "#FFFFFF", 
          borderRadius: 24, 
          padding: 0,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 12
        }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
            <Text className="text-lg font-semibold" style={{ color: "#111111" }}>
              Unlock early?
            </Text>
            <Pressable onPress={onClose} className="p-2" style={{ margin: -8 }}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            <Text style={{ color: "#374151", fontSize: 16, lineHeight: 24, marginBottom: 16 }}>
              Get instant access to your next daily banger instead of waiting {timeRemaining}.
            </Text>

            {/* Cost display */}
            <View style={{ 
              backgroundColor: "#F9F3F0", 
              borderRadius: 16, 
              padding: 16, 
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FF7A1A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12
                }}>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                </View>
                <Text style={{ color: "#111111", fontSize: 16, fontWeight: "600" }}>
                  Early unlock
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ 
                  color: "#FF7A1A", 
                  fontSize: 16, 
                  fontWeight: "700",
                  marginRight: 4 
                }}>
                  {unlockCost}
                </Text>
                <Ionicons name="sync" size={16} color="#FF7A1A" />
              </View>
            </View>

            {/* Balance */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ color: "#6B7280", fontSize: 14 }}>
                Your balance: 
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                <Text style={{ 
                  color: canAfford ? "#111111" : "#EF4444", 
                  fontSize: 14, 
                  fontWeight: "600",
                  marginRight: 4 
                }}>
                  {spins}
                </Text>
                <Ionicons name="sync" size={14} color={canAfford ? "#6B7280" : "#EF4444"} />
              </View>
            </View>

            {/* Action buttons */}
            <View className="gap-3">
              <Pressable
                onPress={handleUnlock}
                disabled={!canAfford}
                className="h-12 rounded-full overflow-hidden items-center justify-center"
                style={{ 
                  borderWidth: 1, 
                  borderColor: canAfford ? "#FFD3B0" : "#E5E7EB",
                  opacity: canAfford ? 1 : 0.6
                }}
              >
                <LinearGradient 
                  colors={canAfford ? ["#FF8C33", "#FF7A1A"] : ["#F3F4F6", "#E5E7EB"]} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }} 
                  style={{ position: "absolute", inset: 0, borderRadius: 999 }} 
                />
                <Text className="font-semibold" style={{ 
                  color: canAfford ? "#FFFFFF" : "#9CA3AF" 
                }}>
                  {canAfford ? "Unlock now" : "Not enough spins"}
                </Text>
              </Pressable>

              <Pressable 
                onPress={onClose} 
                className="h-12 rounded-full items-center justify-center" 
                style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}
              >
                <Text className="font-semibold" style={{ color: "#374151" }}>
                  Wait {timeRemaining}
                </Text>
              </Pressable>
            </View>

            {!canAfford && (
              <Text style={{ 
                color: "#6B7280", 
                fontSize: 12, 
                textAlign: "center", 
                marginTop: 12,
                lineHeight: 16 
              }}>
                Earn more spins by completing daily streaks or visit the Library
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}