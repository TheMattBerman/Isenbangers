import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Banger } from "../types/banger";
import { useAppStore } from "../state/appStore";
import { cn } from "../utils/cn";
import ShareModal from "./ShareModal";

interface BangerCardProps {
  banger: Banger;
  showCategory?: boolean;
}

export default function BangerCard({ banger, showCategory = true }: BangerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { favoriteBangers, addToFavorites, removeFromFavorites } = useAppStore();
  
  const isFavorite = favoriteBangers.includes(banger.id);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      Speech.speak(banger.text, {
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      setIsPlaying(false);
      Alert.alert("Error", "Could not play audio");
    }
  };

  const handleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(banger.id);
    } else {
      addToFavorites(banger.id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fundraising": return "bg-green-100 text-green-800";
      case "grit": return "bg-red-100 text-red-800";
      case "growth": return "bg-blue-100 text-blue-800";
      case "mindset": return "bg-purple-100 text-purple-800";
      case "startup": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        {showCategory && (
          <View className={cn("px-3 py-1 rounded-full", getCategoryColor(banger.category))}>
            <Text className="text-xs font-semibold capitalize">
              {banger.category}
            </Text>
          </View>
        )}
        {banger.isRare && (
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-800 text-xs font-semibold">
              ⭐ Rare
            </Text>
          </View>
        )}
      </View>

      {/* Quote */}
      <Text className="text-lg leading-relaxed text-gray-800 mb-6 font-medium">
        "{banger.text}"
      </Text>

      {/* Attribution */}
      <Text className="text-sm text-gray-500 mb-6 text-right italic">
        — Greg Isenberg
      </Text>

      {/* Actions */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handlePlayAudio}
          className="flex-row items-center bg-orange-500 px-4 py-3 rounded-xl"
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="white" 
          />
          <Text className="text-white font-semibold ml-2">
            {isPlaying ? "Pause" : "Listen"}
          </Text>
        </Pressable>

        <View className="flex-row items-center space-x-4">
          <Pressable onPress={handleFavorite} className="p-2">
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ef4444" : "#6b7280"}
            />
          </Pressable>
          
          <Pressable onPress={() => setShowShareModal(true)} className="p-2">
            <Ionicons name="share-outline" size={24} color="#6b7280" />
          </Pressable>
        </View>
      </View>
      
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        banger={banger}
      />
    </View>
  );
}