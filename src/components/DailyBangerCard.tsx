import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { format } from "date-fns";
import { cn } from "../utils/cn";
import AudioPlayer from "./AudioPlayer";

interface DailyBangerCardProps {
  quoteId: string;
  category: string;
  date: string;
  quoteText: string;
  authorName: string;
  authorAvatarUrl?: string;
  audioUrl?: string;
  isLocked: boolean;
  onCategoryPress?: (category: string) => void;
}

export default function DailyBangerCard({
  quoteId,
  category,
  date,
  quoteText,
  authorName,
  authorAvatarUrl,
  audioUrl,
  isLocked,
  onCategoryPress,
}: DailyBangerCardProps) {
  const [showFullText, setShowFullText] = useState(false);

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleCategoryPress = () => {
    if (onCategoryPress && !isLocked) {
      onCategoryPress(category);
    }
  };

  const handleExpandPress = () => {
    setShowFullText(!showFullText);
  };

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Daily Banger: ${category}, quote by ${authorName}`}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      {isLocked && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 24,
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#6B7280" }}>
            🔒 Unlock to view
          </Text>
        </View>
      )}

      {/* Header */}
      <View className="flex-row items-center justify-between" style={{ marginBottom: 16 }}>
        <Pressable
          onPress={handleCategoryPress}
          disabled={isLocked}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${category} category`}
        >
          <View className={cn("px-3 py-1 rounded-full", getCategoryColor(category))}>
            <Text className="text-[11px] font-semibold capitalize">{category}</Text>
          </View>
        </Pressable>
        
        <Text className="text-xs" style={{ color: "#6B7280" }}>
          {formatDate(date)}
        </Text>
      </View>

      {/* Quote Text */}
      <View testID="quoteText" style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 22,
            lineHeight: 28.6, // 130% of 22px
            color: "#111111",
            fontWeight: "500",
          }}
          numberOfLines={showFullText ? undefined : 3}
          ellipsizeMode="tail"
        >
          "{quoteText}"
        </Text>
        
        {!showFullText && quoteText.length > 150 && (
          <Pressable
            onPress={handleExpandPress}
            style={{ marginTop: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Expand quote"
          >
            <Text style={{ color: "#f97316", fontSize: 14, fontWeight: "600" }}>
              Expand
            </Text>
          </Pressable>
        )}
        
        {showFullText && (
          <Pressable
            onPress={handleExpandPress}
            style={{ marginTop: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Collapse quote"
          >
            <Text style={{ color: "#f97316", fontSize: 14, fontWeight: "600" }}>
              Collapse
            </Text>
          </Pressable>
        )}
      </View>

      {/* Author Row */}
      <View 
        testID="authorRow" 
        className="flex-row items-center" 
        style={{ marginBottom: audioUrl ? 16 : 0 }}
      >
        {authorAvatarUrl ? (
          <Image
            source={{ uri: authorAvatarUrl }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginRight: 12,
              backgroundColor: "#E5E7EB",
            }}
            accessibilityLabel={`${authorName}'s avatar`}
          />
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              marginRight: 12,
              backgroundColor: "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View className="flex-1">
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#111111" }}>
            {authorName}
          </Text>
        </View>
      </View>

      {/* Audio Area */}
      {audioUrl && (
        <View testID="playArea">
          <AudioPlayer audioUrl={audioUrl} />
        </View>
      )}
    </View>
  );
}