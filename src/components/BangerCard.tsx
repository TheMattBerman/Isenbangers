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
import { shareAsText } from "../utils/sharing";

interface BangerCardProps {
  banger: Banger;
  showCategory?: boolean;
}

export default function BangerCard({ banger, showCategory = true }: BangerCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useSharedValue(0);

  const { favoriteBangers, addToFavorites, removeFromFavorites } = useAppStore();
  const isFavorite = favoriteBangers.includes(banger.id);

  const showToast = (msg: string) => {
    setToast(msg);
    toastOpacity.value = withTiming(1, { duration: 150 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => setToast(null), 260);
    }, 1400);
  };



  const handleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(banger.id);
    } else {
      addToFavorites(banger.id);
    }
  };

  const handleCopy = async () => {
    try {
      const ok = await shareAsText(banger);
      showToast(ok ? "Copied to clipboard" : "Copy failed");
      Haptics.selectionAsync();
    } catch {
      showToast("Copy failed");
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

  // Toast animated style
  const toastStyle = useAnimatedStyle(() => ({ opacity: toastOpacity.value }));

  // Press micro-interactions
  const copyScale = useSharedValue(1);
  const favScale = useSharedValue(1);
  const shareScale = useSharedValue(1);

  return (
    <View className="px-6">
      {/* Light Glass Card */}
      <View className="relative">
        <View
          className="rounded-2xl"
          style={{
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E6E3DA",
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
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

      {/* Action Bar */}
      <View className="flex-row items-center" style={{ marginTop: 32 }}>
        {/* Copy */}
        <Animated.View style={{ flex: 1, alignItems: "center" }}>
          <Pressable
            onPress={handleCopy}
            onPressIn={() => { copyScale.value = withTiming(0.96, { duration: 90 }); }}
            onPressOut={() => { copyScale.value = withTiming(1, { duration: 120 }); }}
            accessibilityLabel="Copy quote"
            style={{ alignItems: "center", padding: 8 }}
            hitSlop={12}
          >
            <Animated.View style={[{ transform: [{ scale: copyScale.value }] } as any]}>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
                <Ionicons name="copy-outline" size={20} color="#374151" />
              </View>
            </Animated.View>
            <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Copy</Text>
          </Pressable>
        </Animated.View>

        {/* Favorite */}
        <Animated.View style={{ flex: 1, alignItems: "center" }}>
          <Pressable
            onPress={handleFavorite}
            onPressIn={() => { favScale.value = withTiming(0.96, { duration: 90 }); }}
            onPressOut={() => { favScale.value = withTiming(1, { duration: 120 }); }}
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
            style={{ alignItems: "center", padding: 8 }}
            hitSlop={12}
          >
            <Animated.View style={[{ transform: [{ scale: favScale.value }] } as any]}>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#EF4444" : "#374151"} />
              </View>
            </Animated.View>
            <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Favorite</Text>
          </Pressable>
        </Animated.View>

        {/* Share */}
        <Animated.View style={{ flex: 1, alignItems: "center" }}>
          <Pressable
            onPress={() => setShowShareModal(true)}
            onPressIn={() => { shareScale.value = withTiming(0.96, { duration: 90 }); }}
            onPressOut={() => { shareScale.value = withTiming(1, { duration: 120 }); }}
            accessibilityLabel="Share quote"
            style={{ alignItems: "center", padding: 8 }}
            hitSlop={12}
          >
            <Animated.View style={[{ transform: [{ scale: shareScale.value }] } as any]}>
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
                <Ionicons name="share-outline" size={20} color="#374151" />
              </View>
            </Animated.View>
            <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Share</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          style={[{ marginTop: 12, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, toastStyle]}
        >
          <Text className="text-xs" style={{ color: "#111111" }}>{toast}</Text>
        </Animated.View>
      ) : null}

      <ShareModal visible={showShareModal} onClose={() => setShowShareModal(false)} banger={banger} />
    </View>
  );
}
