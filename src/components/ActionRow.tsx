import React, { useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring } from "react-native-reanimated";

import { Banger } from "../types/banger";
import { shareAsText } from "../utils/sharing";

interface ActionRowProps {
  onShare: () => void;
  onSave: () => void;
  onCopy: () => void;
  isSaved: boolean;
  banger?: Banger; // Optional for now, to support existing usage
}

export default function ActionRow({ onShare, onSave, onCopy, isSaved, banger }: ActionRowProps) {
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useSharedValue(0);

  // Animation values
  const shareScale = useSharedValue(1);
  const saveScale = useSharedValue(1);
  const copyScale = useSharedValue(1);
  const heartBurstScale = useSharedValue(1);

  // Get screen width for responsive layout
  const screenWidth = Dimensions.get('window').width;
  const isNarrowScreen = screenWidth < 380;

  const showToast = (msg: string) => {
    setToast(msg);
    toastOpacity.value = withTiming(1, { duration: 150 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => setToast(null), 260);
    }, 1400);
  };

  const handleCopy = async () => {
    try {
      if (banger) {
        const success = await shareAsText(banger);
        showToast(success ? "Copied with attribution" : "Copy failed");
        if (success) {
          onCopy();
          Haptics.selectionAsync();
        }
      } else {
        // Fallback for stories/tests
        showToast("Copied with attribution");
        onCopy();
        Haptics.selectionAsync();
      }
    } catch {
      showToast("Copy failed");
    }
  };

  const handleSave = () => {
    // Trigger heart burst animation when saving
    if (!isSaved) {
      heartBurstScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
    }
    onSave();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleShare = () => {
    onShare();
    Haptics.selectionAsync();
  };

  // Toast animated style
  const toastStyle = useAnimatedStyle(() => ({ opacity: toastOpacity.value }));

  // Heart burst animation style
  const heartBurstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartBurstScale.value }]
  }));

  return (
    <View>
      {/* Action Row */}
      <View className="flex-row items-center" style={{ marginTop: 16 }}>
        {/* Secondary Actions - Save and Copy */}
        <View className="flex-row" style={{ flex: 1 }}>
          {/* Save Button */}
          <Animated.View style={{ marginRight: 16 }}>
            <Pressable
              onPress={handleSave}
              onPressIn={() => { saveScale.value = withTiming(0.96, { duration: 90 }); }}
              onPressOut={() => { saveScale.value = withTiming(1, { duration: 120 }); }}
              accessibilityLabel={isSaved ? "Remove from favorites" : "Add to favorites"}
              style={{ alignItems: "center", padding: 8 }}
              hitSlop={12}
            >
              <Animated.View style={[{ transform: [{ scale: saveScale.value }] } as any, heartBurstStyle]}>
                <View 
                  className="w-11 h-11 rounded-full items-center justify-center" 
                  style={{ 
                    backgroundColor: "#FFFFFF", 
                    borderWidth: 1, 
                    borderColor: "#E6E3DA" 
                  }}
                >
                  <Ionicons 
                    name={isSaved ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isSaved ? "#EF4444" : "#374151"} 
                  />
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* Copy Button */}
          <Animated.View>
            <Pressable
              onPress={handleCopy}
              onPressIn={() => { copyScale.value = withTiming(0.96, { duration: 90 }); }}
              onPressOut={() => { copyScale.value = withTiming(1, { duration: 120 }); }}
              accessibilityLabel="Copy quote"
              style={{ alignItems: "center", padding: 8 }}
              hitSlop={12}
            >
              <Animated.View style={[{ transform: [{ scale: copyScale.value }] } as any]}>
                <View 
                  className="w-11 h-11 rounded-full items-center justify-center" 
                  style={{ 
                    backgroundColor: "#FFFFFF", 
                    borderWidth: 1, 
                    borderColor: "#E6E3DA" 
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#374151" />
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Primary Share Button */}
        <Animated.View style={{ flex: isNarrowScreen ? 2 : 1, alignItems: isNarrowScreen ? "stretch" : "flex-end" }}>
          <Pressable
            onPress={handleShare}
            onPressIn={() => { shareScale.value = withTiming(0.96, { duration: 90 }); }}
            onPressOut={() => { shareScale.value = withTiming(1, { duration: 120 }); }}
            accessibilityLabel="Share quote"
            style={[
              {
                paddingHorizontal: isNarrowScreen ? 16 : 24,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: "#f97316",
                alignItems: "center",
                justifyContent: "center",
                minWidth: isNarrowScreen ? undefined : 120,
              },
              isNarrowScreen ? { width: "100%" } : {}
            ]}
          >
            <Animated.View style={[{ transform: [{ scale: shareScale.value }] } as any, { flexDirection: "row", alignItems: "center" }]}>
              <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text className="text-white font-semibold text-sm">Share</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Toast */}
      {toast ? (
        <Animated.View
          style={[
            { 
              marginTop: 12, 
              alignSelf: "center", 
              paddingHorizontal: 14, 
              paddingVertical: 8, 
              borderRadius: 12, 
              backgroundColor: "#FFFFFF", 
              borderWidth: 1, 
              borderColor: "#E6E3DA", 
              shadowColor: "#000", 
              shadowOpacity: 0.06, 
              shadowRadius: 8, 
              shadowOffset: { width: 0, height: 2 } 
            }, 
            toastStyle
          ]}
        >
          <Text className="text-xs" style={{ color: "#111111" }}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}