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

  // Debug logging
  console.log("BangerCard - Rendering banger:", banger.id, banger.text.substring(0, 50) + "...");
  
  // Validate banger data
  if (!banger || !banger.text) {
    return (
      <View style={{ padding: 20, backgroundColor: '#fee2e2', borderRadius: 16, margin: 16 }}>
        <Text style={{ color: '#dc2626', textAlign: 'center' }}>
          Error: Invalid banger data
        </Text>
      </View>
    );
  }

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
    <View 
      className="bg-white rounded-2xl p-6 mx-4 shadow-lg border border-gray-100"
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        minHeight: 200,
      }}
    >
      {/* Header */}
      <View 
        className="flex-row items-center justify-between mb-4"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        {showCategory && (
          <View 
            className={cn("px-3 py-1 rounded-full", getCategoryColor(banger.category))}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: '#f3f4f6',
            }}
          >
            <Text 
              className="text-xs font-semibold capitalize"
              style={{
                fontSize: 10,
                fontWeight: '600',
                textTransform: 'capitalize',
                color: '#374151',
              }}
            >
              {banger.category}
            </Text>
          </View>
        )}
        {banger.isRare && (
          <View 
            className="bg-yellow-100 px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#fef3c7',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text 
              className="text-yellow-800 text-xs font-semibold"
              style={{
                color: '#92400e',
                fontSize: 10,
                fontWeight: '600',
              }}
            >
              ⭐ Rare
            </Text>
          </View>
        )}
      </View>

      {/* Quote */}
      <Text 
        className="text-lg leading-relaxed text-gray-800 mb-6 font-medium"
        style={{
          fontSize: 18,
          lineHeight: 28,
          color: '#1f2937',
          marginBottom: 24,
          fontWeight: '500',
        }}
      >
        "{banger.text}"
      </Text>

      {/* Attribution */}
      <Text 
        className="text-sm text-gray-500 mb-6 text-right italic"
        style={{
          fontSize: 12,
          color: '#6b7280',
          marginBottom: 24,
          textAlign: 'right',
          fontStyle: 'italic',
        }}
      >
        — Greg Isenberg
      </Text>

      {/* Actions */}
      <View 
        className="flex-row items-center justify-between"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={handlePlayAudio}
          className="flex-row items-center bg-orange-500 px-4 py-3 rounded-xl"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f97316',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={20} 
            color="white" 
          />
          <Text 
            className="text-white font-semibold ml-2"
            style={{
              color: 'white',
              fontWeight: '600',
              marginLeft: 8,
              fontSize: 16,
            }}
          >
            {isPlaying ? "Pause" : "Listen"}
          </Text>
        </Pressable>

        <View 
          className="flex-row items-center space-x-4"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Pressable 
            onPress={handleFavorite} 
            className="p-2"
            style={{ padding: 8 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ef4444" : "#6b7280"}
            />
          </Pressable>
          
          <Pressable 
            onPress={() => setShowShareModal(true)} 
            className="p-2"
            style={{ padding: 8 }}
          >
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