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
      case "fundraising": return "bg-purple-500/20 text-purple-200";
      case "grit": return "bg-pink-500/20 text-pink-200";
      case "growth": return "bg-blue-500/20 text-blue-200";
      case "mindset": return "bg-fuchsia-500/20 text-fuchsia-200";
      case "startup": return "bg-orange-500/20 text-orange-200";
      default: return "bg-white/10 text-white/80";
    }
  };

  // Toast animated style
  const toastStyle = useAnimatedStyle(() => ({ opacity: toastOpacity.value }));

  return (
    <View className="px-4">
      {/* Neon Glass Card */}
      <View className="relative">
        <LinearGradient
          colors={["#1B102B", "#0E0A17"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20 }}
        >
          <View
            className="rounded-2xl p-6"
            style={{
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(192, 132, 252, 0.2)",
              shadowColor: "#A855F7",
              shadowOpacity: 0.35,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              {showCategory && (
                <View className={cn("px-3 py-1 rounded-full", getCategoryColor(banger.category))}>
                  <Text className="text-[10px] font-semibold capitalize">{banger.category}</Text>
                </View>
              )}
              {banger.isRare && (
                <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Text className="text-yellow-200 text-[10px] font-semibold">⭐ Rare</Text>
                </View>
              )}
            </View>

            {/* Quote */}
            <Text className="text-white text-xl leading-8 font-medium mb-6">
              "{banger.text}"
            </Text>

            {/* Attribution band */}
            <View className="overflow-hidden rounded-xl">
              <LinearGradient
                colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 12, paddingHorizontal: 14 }}
              >
                <Text className="text-white/70 text-right italic text-xs">— Greg Isenberg</Text>
              </LinearGradient>
            </View>

            {/* Floating Play Button */}
            <View style={{ height: 28 }} />
          </View>
        </LinearGradient>

        <View style={{ position: "absolute", left: 0, right: 0, bottom: -24, alignItems: "center" }}>
          <View style={{ position: "absolute", top: -18 }}>
            <AnimatedWaveBars active={isPlaying} width={80} height={30} color="#C084FC" />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}
            onPress={handlePlayAudio}
            className="items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#7C3AED",
              shadowColor: "#A855F7",
              shadowOpacity: 0.6,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Action Bar */}
      <View className="mt-12 flex-row items-center justify-evenly">
        <Pressable
          onPress={handleCopy}
          accessibilityLabel="Copy quote"
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
            <Ionicons name="copy-outline" size={20} color="#E5E7EB" />
          </View>
          <Text className="text-white/70 text-xs mt-2">Copy</Text>
        </Pressable>

        <Pressable
          onPress={handleFavorite}
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FCA5A5" : "#E5E7EB"} />
          </View>
          <Text className="text-white/70 text-xs mt-2">Favorite</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowShareModal(true)}
          accessibilityLabel="Share quote"
          style={{ alignItems: "center", padding: 8 }}
          hitSlop={12}
        >
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
            <Ionicons name="share-outline" size={20} color="#E5E7EB" />
          </View>
          <Text className="text-white/70 text-xs mt-2">Share</Text>
        </Pressable>
      </View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          style={[{ marginTop: 12, alignSelf: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(17,17,17,0.9)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }, toastStyle]}
        >
          <Text className="text-white text-xs">{toast}</Text>
        </Animated.View>
      ) : null}

      <ShareModal visible={showShareModal} onClose={() => setShowShareModal(false)} banger={banger} />
    </View>
  );
}
