import React, { useMemo, useRef } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  Canvas,
  Path,
  Circle,
  Group,
  SweepGradient,
  vec,
  BlurMask,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import {
  PANEL_COUNT,
  BULB_COUNT,
  buildSegmentPath,
  getPanelIndexFromAngle,
  isRarePanel,
} from "../utils/spinWheelMath";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.9, 360);
const RADIUS = WHEEL_SIZE / 2;
const INNER_RADIUS = RADIUS * 0.55;

interface SpinWheelProps {
  onSpinComplete: (isRare: boolean) => void;
  isSpinning: boolean;
}

export default function SpinWheel({ onSpinComplete, isSpinning }: SpinWheelProps) {
  const rotation = useSharedValue(0);
  const localSpinningRef = useRef(false);

  const panelAngle = 360 / PANEL_COUNT;

  const segments = useMemo(() => {
    const cx = RADIUS;
    const cy = RADIUS;
    return new Array(PANEL_COUNT).fill(0).map((_, i) => {
      const start = i * panelAngle - 90; // start from top
      const end = start + panelAngle;
      const path = buildSegmentPath(cx, cy, INNER_RADIUS, RADIUS * 0.95, start, end);
      return { path, index: i };
    });
  }, [panelAngle]);

  const bulbs = useMemo(() => {
    const cx = RADIUS;
    const cy = RADIUS;
    const outer = RADIUS * 0.98;
    return new Array(BULB_COUNT).fill(0).map((_, i) => {
      const angle = i * (360 / BULB_COUNT) - 90;
      const a = (angle * Math.PI) / 180;
      return { x: cx + outer * Math.cos(a), y: cy + outer * Math.sin(a) };
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 900 },
        { rotateX: "18deg" },
        { rotate: `${rotation.value}deg` },
      ],
    } as any;
  });

  const notifySuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const clearLocalSpinning = () => {
    localSpinningRef.current = false;
  };

  const spin = () => {
    if (isSpinning || localSpinningRef.current) return;
    localSpinningRef.current = true;

    const turns = 3 + Math.random() * 1.5; // 3 to 4.5 turns
    const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
    const panelCenter = targetPanel * panelAngle + panelAngle / 2;
    const base = rotation.value % 360;
    const targetDeg = base + turns * 360 + panelCenter;

    const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

    rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
      if (!finished) return;
      const index = getPanelIndexFromAngle(targetDeg, PANEL_COUNT);
      const rare = isRarePanel(index);
      runOnJS(notifySuccess)();
      runOnJS(clearLocalSpinning)();
      runOnJS(onSpinComplete)(rare);
    });
  };

  // Colors
  const rimOuter = "#1f2937";
  const rimInner = "#111827";
  const panelStart = "#2a2e6e";
  const panelEnd = "#3b46a0";

  return (
    <View style={{ width: WHEEL_SIZE, alignItems: "center" }}>
      {/* Pointer */}
      <View
        style={{
          position: "absolute",
          top: -8,
          zIndex: 10,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderBottomWidth: 28,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#9ca3af",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
          }}
        />
      </View>

      {/* Wheel */}
      <Animated.View style={[{ width: WHEEL_SIZE, height: WHEEL_SIZE }, animatedStyle]}>
        <Canvas style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
          {/* Rim */}
          <Group>
            <Circle cx={RADIUS} cy={RADIUS} r={RADIUS} color={rimOuter} />
            <Circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.92} color={rimInner} />
          </Group>

          {/* Panels */}
          {segments.map(({ path, index }) => (
            <Group key={index}>
              <Path path={path} color={panelEnd}>
                <SweepGradient
                  c={vec(RADIUS, RADIUS)}
                  colors={[panelStart, panelEnd]}
                  positions={[0, 1]}
                />
              </Path>
              {/* highlight arc */}
              <Path path={path} color="rgba(255,255,255,0.06)" />
            </Group>
          ))}

          {/* Bulbs */}
          <Group>
            {bulbs.map((b, i) => (
              <Group key={i}>
                <Circle cx={b.x} cy={b.y} r={5} color="#fbbf24">
                  <BlurMask blur={8} style="normal" />
                </Circle>
                <Circle cx={b.x} cy={b.y} r={3} color="#fde68a" />
              </Group>
            ))}
          </Group>

          {/* Center hub */}
          <Group>
            <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.6} color="#0b0f19" />
            <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.45} color="#111827" />
          </Group>
        </Canvas>
      </Animated.View>

      {/* Spin Button */}
      <Pressable
        onPress={spin}
        disabled={isSpinning || localSpinningRef.current}
        style={{
          marginTop: 20,
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isSpinning || localSpinningRef.current ? "#9ca3af" : "#f97316",
        }}
      >
        <Ionicons name="refresh" size={22} color="white" />
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16, marginLeft: 8 }}>
          {isSpinning || localSpinningRef.current ? "Spinning..." : "Spin"}
        </Text>
      </Pressable>
    </View>
  );
}
