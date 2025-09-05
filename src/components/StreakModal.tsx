import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS } from "react-native-reanimated";

export type WeekDay = { label: string; filled: boolean };

export function buildWeekRow(streakCount: number, todayIdx: number): WeekDay[] {
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const res: WeekDay[] = labels.map((l) => ({ label: l, filled: false }));
  const fill = Math.max(0, Math.min(7, streakCount));
  for (let i = 0; i < fill; i++) {
    const idx = (todayIdx - i + 7) % 7;
    res[idx].filled = true;
  }
  return res;
}

interface Props {
  visible: boolean;
  mode: "earned" | "lost";
  streakCount: number;
  week: WeekDay[];
  onContinue: () => void;
}

export default function StreakModal({ visible, mode, streakCount, week, onContinue }: Props) {
  const lost = mode === "lost";

  // Animations
  const backOpacity = useSharedValue(0);
  const cardY = useSharedValue(24);
  const cardScale = useSharedValue(0.98);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      backOpacity.value = withTiming(1, { duration: 220, easing: Easing.ease });
      cardY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
      cardScale.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      if (!lost) {
        flameScale.value = 0.96;
        flameScale.value = withDelay(80, withTiming(1, { duration: 160 }));
      }
    }
  }, [visible]);

  const backStyle = useAnimatedStyle(() => ({ opacity: backOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: cardY.value }, { scale: cardScale.value }] }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flameScale.value }] }));

  const exiting = useRef(false);
  const handleClose = () => {
    if (exiting.current) return;
    exiting.current = true;
    backOpacity.value = withTiming(0, { duration: 180 });
    cardY.value = withTiming(24, { duration: 180 });
    cardScale.value = withTiming(0.98, { duration: 180 }, () => {
      runOnJS(onContinue)();
      exiting.current = false;
    });
  };

  return (
    <Modal visible={visible} transparent onRequestClose={handleClose}>
      <Animated.View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }, backStyle]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} accessibilityLabel="Dismiss streak modal" />
        <Animated.View style={[{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 }, cardStyle]} accessibilityViewIsModal importantForAccessibility="yes">
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderColor: "#E6E3DA" }}>
            <Text style={{ color: "#111111", fontWeight: "700" }}>Isenbangers</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="flame" size={16} color={lost ? "#D1D5DB" : "#FF7A1A"} />
              <Text style={{ marginLeft: 6, color: lost ? "#9CA3AF" : "#111111", fontWeight: "600" }}>{streakCount}</Text>
            </View>
          </View>

          {/* Graphic */}
          <View style={{ alignItems: "center", paddingTop: 20 }}>
            <Animated.View style={[{ width: 72, height: 72, borderRadius: 36, backgroundColor: lost ? "#F3F4F6" : "#FFF2E6", alignItems: "center", justifyContent: "center" }, flameStyle]}>
              <View style={{ position: "absolute", width: 72, height: 72, borderRadius: 36, backgroundColor: lost ? "transparent" : "rgba(255,122,26,0.15)" }} />
              <Ionicons name="flame" size={36} color={lost ? "#9CA3AF" : "#FF7A1A"} />
              <View style={{ position: "absolute", right: -6, bottom: -6, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E6E3DA", paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: "#111111", fontWeight: "700", fontSize: 12 }}>{streakCount}</Text>
              </View>
            </Animated.View>
            <Text style={{ marginTop: 12, fontSize: 22, fontWeight: "700", color: "#111111", textAlign: "center" }}>
              {lost ? `${streakCount} Day streak lost` : `${streakCount} Day streak`}
            </Text>
          </View>

          {/* Week row */}
          <View style={{ marginTop: 16, marginHorizontal: 16, padding: 10, borderRadius: 12, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E6E3DA" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              {week.map((d, i) => (
                <Text key={`lbl-${i}`} style={{ color: "#6B7280", fontWeight: "600" }}>{d.label}</Text>
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {week.map((d, i) => (
                <Animated.View
                  key={`dot-${i}`}
                  style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: lost ? "#D1D5DB" : "#111111", backgroundColor: d.filled ? (lost ? "#D1D5DB" : "#111111") : "transparent", transform: [{ scale: 1 }] }}
                />
              ))}
            </View>
          </View>

          {/* Subtext */}
          <View style={{ marginTop: 14, paddingHorizontal: 16 }}>
            <Text style={{ color: "#6B7280", textAlign: "center" }} numberOfLines={2}>
              {lost ? "Don't give up. Spin today to get back on track!" : "You're on fire! Every day matters."}
            </Text>
          </View>

          {/* CTA */}
          <View style={{ marginTop: 18, paddingHorizontal: 16 }}>
            <Pressable accessibilityRole="button" onPress={handleClose} style={{ backgroundColor: lost ? "transparent" : "#111111", borderWidth: lost ? 2 : 0, borderColor: "#111111", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}>
              <Text style={{ color: lost ? "#111111" : "#FFFFFF", fontWeight: "700" }}>Continue</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
