import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Banger } from "../types/banger";
import { useAppStore } from "../state/appStore";
import { cn } from "../utils/cn";
import ShareModal from "./ShareModal";
import AudioMiniPlayer from "./AudioMiniPlayer";
import ActionRow from "./ActionRow";

interface BangerCardProps {
  banger: Banger;
  showCategory?: boolean;
}

export default function BangerCard({ banger, showCategory = true }: BangerCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const { favoriteBangers, addToFavorites, removeFromFavorites } = useAppStore();
  const isFavorite = favoriteBangers.includes(banger.id);

  const handleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(banger.id);
    } else {
      addToFavorites(banger.id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fundraising": return "bg-purple-50 text-purple-700";
      case "grit": return "bg-pink-50 text-pink-700";
      case "growth": return "bg-blue-50 text-blue-700";
      case "mindset": return "bg-fuchsia-50 text-fuchsia-700";
      case "startup": return "bg-orange-50 text-orange-700";
      default: return "bg-gray-100 text-gray-800";
    }
  };


  return (
    <View className="px-6">
      {/* Light Glass Card */}
      <View className="relative">
        <View
          className="rounded-2xl"
          style={{
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            padding: 24,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
            {showCategory && (
              <View className={cn("px-3 py-1 rounded-full", getCategoryColor(banger.category))}>
                <Text className="text-[11px] font-semibold capitalize">{banger.category}</Text>
              </View>
            )}
            {banger.isRare && (
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: "#FEF3C7" }}>
                <Text className="text-[11px] font-semibold" style={{ color: "#92400E" }}>⭐ Rare</Text>
              </View>
            )}
          </View>

          {/* Quote */}
          <Text className="text-xl leading-8 font-medium" style={{ color: "#111111", marginBottom: 8 }} numberOfLines={6} ellipsizeMode="tail">
            "{banger.text}"
          </Text>

          {/* Attribution */}
          <Text className="text-xs italic" style={{ color: "#6B7280", textAlign: "right", marginTop: 6 }}>— Greg Isenberg</Text>

          {/* Audio mini player under quote */}
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <AudioMiniPlayer text={banger.text} />
          </View>
        </View>


      </View>

      {/* Action Row */}
      <View style={{ marginTop: 32 }}>
        <ActionRow
          onShare={() => setShowShareModal(true)}
          onSave={handleFavorite}
          onCopy={() => {}} // Copy is handled internally by ActionRow
          isSaved={isFavorite}
          banger={banger}
        />
      </View>

      <ShareModal visible={showShareModal} onClose={() => setShowShareModal(false)} banger={banger} />
    </View>
  );
}
