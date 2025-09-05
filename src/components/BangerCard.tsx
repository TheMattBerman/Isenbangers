import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Banger } from "../types/banger";
import { useAppStore } from "../state/appStore";
import { cn } from "../utils/cn";
import ShareModal from "./ShareModal";
import AnimatedWaveBars from "./AnimatedWaveBars";
import { shareAsText } from "../utils/sharing";

interface BangerCardProps {
  banger: Banger;
  showCategory?: boolean;
}

export default function BangerCard({ banger, showCategory = true }: BangerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handlePlayAudio = async () => {
    try {
      if (isPlaying) {
        Speech.stop();
        setIsPlaying(false);
        Haptics.selectionAsync();
        return;
      }
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Speech.speak(banger.text, {
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => {
          setIsPlaying(false);
          showToast("Could not play audio");
        },
      });
    } catch (e) {
      setIsPlaying(false);
      showToast("Could not play audio");
    }
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

  // Play press micro-interaction
  const playScale = useSharedValue(1);
  const playScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: playScale.value }] }));

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
            padding: 20,
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
          <Text className="text-xl leading-8 font-medium" style={{ color: "#111111", marginBottom: 16 }}>
            "{banger.text}"
          </Text>

          {/* Attribution strip */}
          <View style={{ paddingTop: 12, borderTopWidth: 1, borderColor: "#E6E3DA" }}>
            <Text className="text-xs italic" style={{ color: "#6B7280", textAlign: "right" }}>— Greg Isenberg</Text>
          </View>

          {/* Spacer for floating Play */}
          <View style={{ height: 24 }} />
        </View>

        {/* Floating Play with waves */}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: -24, alignItems: "center" }}>
          <View style={{ position: "absolute", top: -18 }}>
            <AnimatedWaveBars active={isPlaying} width={80} height={28} color="#FF7A1A" />
          </View>
          <Animated.View style={[playScaleStyle]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}
              onPressIn={() => { playScale.value = withTiming(0.96, { duration: 90 }); }}
              onPressOut={() => { playScale.value = withTiming(1, { duration: 120 }); }}
              onPress={handlePlayAudio}
              className="items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: "hidden",
                shadowColor: "#FF7A1A",
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                borderWidth: 1,
                borderColor: "#FFD3B0",
              }}
            >
              <LinearGradient
                colors={["#FF8C33", "#FF7A1A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", inset: 0, borderRadius: 32 }}
              />
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Action Bar */}
      <View className="flex-row items-center justify-evenly" style={{ marginTop: 40 }}>
        <Pressable
          onPress={handleCopy}
          accessibilityLabel="Copy quote"
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
            <Ionicons name="copy-outline" size={20} color="#374151" />
          </View>
          <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Copy</Text>
        </Pressable>

        <Pressable
          onPress={handleFavorite}
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#EF4444" : "#374151"} />
          </View>
          <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Favorite</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowShareModal(true)}
          accessibilityLabel="Share quote"
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E6E3DA" }}>
            <Ionicons name="share-outline" size={20} color="#374151" />
          </View>
          <Text className="text-xs mt-2" style={{ color: "#6B7280" }}>Share</Text>
        </Pressable>
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
