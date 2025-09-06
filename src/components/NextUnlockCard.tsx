import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  Easing,
  useAnimatedProps,
  interpolate
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAppStore } from "../state/appStore";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NextUnlockCardProps {
  endAtMs: number;
  onUnlocked?: () => void;
  onPaywallOpen?: () => void;
}

function humanizeTime(msRemaining: number) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function NextUnlockCard({ endAtMs, onUnlocked, onPaywallOpen }: NextUnlockCardProps) {
  const [now, setNow] = useState(Date.now());
  const {} = useAppStore();
  
  const unlockedRef = useRef(false);
  
  // Ring dimensions per spec
  const ringDiameter = 64;
  const ringRadius = ringDiameter / 2;
  const strokeWidth = 8;
  const innerRadius = ringRadius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  // Update time every minute for battery efficiency
  useEffect(() => {
    const updateInterval = 60000; // 1 minute
    const id = setInterval(() => setNow(Date.now()), updateInterval);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endAtMs - now);
  const isUnlocked = remaining <= 0;
  const isNearReady = remaining <= 2 * 60 * 60 * 1000 && remaining > 0; // Within 2 hours
  
  // More accurate progress calculation based on actual duration
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
  const elapsed = totalDuration - remaining;
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration));
  
  // Handle unlock completion
  useEffect(() => {
    if (isUnlocked && !unlockedRef.current) {
      unlockedRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlocked?.();
    }
  }, [isUnlocked, onUnlocked]);

  // Animations
  const scaleValue = useSharedValue(1);
  const pulseValue = useSharedValue(1);
  const progressValue = useSharedValue(progress);
  
  // Update progress animation
  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  // Pulsing animation for near-ready state
  useEffect(() => {
    if (isNearReady && !isUnlocked) {
      pulseValue.value = withRepeat(
        withTiming(1.03, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      pulseValue.value = withTiming(1, { duration: 200 });
    }
  }, [isNearReady, isUnlocked]);

  // Animated ring styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }]
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  // Calculate stroke dash offset for progress
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value * circumference);
    return {
      strokeDashoffset
    };
  });

  const handleRingPress = () => {
    if (isUnlocked) {
      Haptics.selectionAsync();
      onUnlocked?.();
    }
  };

  const handlePaywallPress = () => {
    if (!isUnlocked) {
      Haptics.selectionAsync();
      onPaywallOpen?.();
    }
  };


  const timeDisplay = useMemo(() => {
    if (isUnlocked) return "Ready!";
    return humanizeTime(remaining);
  }, [remaining, isUnlocked]);

  return (
    <>
      <Animated.View style={[cardStyle]}>
        <View style={{
          backgroundColor: "#1C1C1E", // Dark background like the example
          borderRadius: 24,
          height: 140,
          marginHorizontal: 32, // Further increased to make card narrower and match daily content card spacing
          padding: 20,
          position: "relative",
          shadowColor: "#000000",
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8
        }}>
          {/* Background gradient overlay */}
          <LinearGradient
            colors={["rgba(255, 122, 26, 0.1)", "rgba(255, 122, 26, 0.05)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 24
            }}
          />

          {/* Main Content Row */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
            {/* Ring Container */}
            <Pressable
              onPress={handleRingPress}
              onPressIn={() => { scaleValue.value = withTiming(0.95, { duration: 100 }); }}
              onPressOut={() => { scaleValue.value = withTiming(1, { duration: 150 }); }}
              style={{ width: ringDiameter, height: ringDiameter, position: "relative" }}
              disabled={!isUnlocked}
              accessibilityRole="button"
              accessibilityLabel={isUnlocked ? "Play daily banger" : `Daily banger unlocks in ${timeDisplay}`}
              accessibilityHint={isUnlocked ? "Tap to play" : "Use unlock button to get early access"}
            >
            <Animated.View style={[buttonStyle, { width: ringDiameter, height: ringDiameter }]}>
              {/* SVG Progress Ring */}
              <Svg width={ringDiameter} height={ringDiameter} style={{ position: "absolute" }}>
                <Defs>
                  <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF8C33" stopOpacity="0.9" />
                    <Stop offset="50%" stopColor="#FF7A1A" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#FF7A1A" stopOpacity="1" />
                  </SvgGradient>
                </Defs>
                
                {/* Background ring */}
                <Circle
                  cx={ringRadius}
                  cy={ringRadius}
                  r={innerRadius}
                  stroke="rgba(255, 255, 255, 0.2)" // Subtle white for dark theme
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                
                {/* Progress ring */}
                <AnimatedCircle
                  cx={ringRadius}
                  cy={ringRadius}
                  r={innerRadius}
                  stroke={isUnlocked ? "#10B981" : "url(#progressGradient)"}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animatedProps={animatedCircleProps}
                  transform={`rotate(-90 ${ringRadius} ${ringRadius})`}
                />
              </Svg>

              {/* Center content */}
              <View style={{
                position: "absolute",
                width: 40,
                height: 40,
                left: (ringDiameter - 40) / 2,
                top: (ringDiameter - 40) / 2,
                alignItems: "center",
                justifyContent: "center"
              }}>
                {isUnlocked ? (
                  <Ionicons name="play" size={20} color="#10B981" />
                ) : (
                  <Ionicons name="flame" size={20} color="#FFFFFF" />
                )}
              </View>

              {/* Enhanced glow effect for near-ready state */}
              {isNearReady && !isUnlocked && (
                <>
                  <View style={{
                    position: "absolute",
                    width: ringDiameter + 16,
                    height: ringDiameter + 16,
                    left: -8,
                    top: -8,
                    borderRadius: (ringDiameter + 16) / 2,
                    shadowColor: "#FF7A1A",
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 0 },
                    backgroundColor: "rgba(255, 122, 26, 0.1)"
                  }} />
                  <View style={{
                    position: "absolute",
                    width: ringDiameter + 8,
                    height: ringDiameter + 8,
                    left: -4,
                    top: -4,
                    borderRadius: (ringDiameter + 8) / 2,
                    backgroundColor: "rgba(255, 122, 26, 0.15)"
                  }} />
                </>
              )}
            </Animated.View>
          </Pressable>

            {/* Text Content */}
            <View style={{ flex: 1, marginLeft: 20, justifyContent: "center" }}>
              <Text style={{
                fontSize: 14,
                fontWeight: "500", 
                color: "rgba(255, 255, 255, 0.7)", // muted white
                marginBottom: 2,
                letterSpacing: 0.3
              }}>
                Next drop
              </Text>
              
              <Text style={{
                fontSize: 32,
                fontWeight: "700", // bold
                color: "#FFFFFF",
                marginBottom: 0,
                letterSpacing: -0.5
              }}>
                {timeDisplay}
              </Text>
            </View>

            {/* Unlock button integrated in layout */}
            <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
              {!isUnlocked ? (
                <Pressable
                  onPress={handlePaywallPress}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 24,
                    shadowColor: "#000000",
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Unlock early access"
                >
                  <LinearGradient
                    colors={["#FF8C33", "#FF7A1A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 24
                    }}
                  />
                  <Text style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    textAlign: "center"
                  }}>
                    Unlock
                  </Text>
                </Pressable>
              ) : (
                <View style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: "rgba(16, 185, 129, 0.9)",
                  borderRadius: 24,
                  shadowColor: "#10B981",
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3
                }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#FFFFFF"
                  }}>
                    Ready!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

    </>
  );
}