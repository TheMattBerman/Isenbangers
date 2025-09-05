import React, { useMemo, useRef, useCallback } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  RARE_PANEL_INDEXES,
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
  const savedRotationDeg = useSharedValue(0);
  const startAngleDeg = useSharedValue(0);
  const spinning = useSharedValue(0);
  const localSpinningRef = useRef(false);

  const panelAngle = 360 / PANEL_COUNT;
  const RARE_INDEXES = RARE_PANEL_INDEXES;

  // Create stable function references for worklet usage
  const handleHapticFeedback = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleSpinComplete = useCallback((rare: boolean) => {
    localSpinningRef.current = false;
    onSpinComplete(rare);
  }, [onSpinComplete]);

  const setLocalSpinTrue = useCallback(() => {
    localSpinningRef.current = true;
  }, []);

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

  const spin = () => {
    if (isSpinning || localSpinningRef.current) return;
    localSpinningRef.current = true;
    spinning.value = 1;

    const turns = 3 + Math.random() * 1.5; // 3 to 4.5 turns
    const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
    const panelCenter = targetPanel * panelAngle + panelAngle / 2;
    const base = rotation.value % 360;
    const targetDeg = base + turns * 360 + panelCenter;

    const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

    rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
      "worklet";
      if (!finished) return;
      // Compute panel index and rarity inside worklet
      const angle = (450 - (targetDeg % 360)) % 360;
      const seg = 360 / PANEL_COUNT;
      const index = Math.floor(angle / seg) % PANEL_COUNT;
      const rare = RARE_INDEXES.indexOf(index) !== -1;
      spinning.value = 0;
      
      runOnJS(handleHapticFeedback)();
      runOnJS(handleSpinComplete)(rare);
    });
  };

  // Colors
  const rimOuter = "#1f2937";
  const rimInner = "#111827";
  const panelStart = "#2a2e6e";
  const panelEnd = "#3b46a0";

  // Gesture: two-finger rotation to pre-rotate and start spin on release
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      "worklet";
      if (spinning.value === 1) return;
      savedRotationDeg.value = rotation.value % 360;
    })
    .onUpdate((e) => {
      "worklet";
      if (spinning.value === 1) return;
      rotation.value = savedRotationDeg.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      "worklet";
      if (spinning.value === 1) return;
      spinning.value = 1;
      runOnJS(setLocalSpinTrue)();

      const turns = 3 + Math.random() * 1.5;
      const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
      const panelCenter = targetPanel * panelAngle + panelAngle / 2;
      const base = rotation.value % 360;
      const targetDeg = base + turns * 360 + panelCenter;
      const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

      rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
        "worklet";
        if (!finished) return;
        const angle = (450 - (targetDeg % 360)) % 360;
        const seg = 360 / PANEL_COUNT;
        const index = Math.floor(angle / seg) % PANEL_COUNT;
        const rare = RARE_INDEXES.indexOf(index) !== -1;
        spinning.value = 0;
        runOnJS(handleHapticFeedback)();
        runOnJS(handleSpinComplete)(rare);
      });
    });

  // Gesture: one-finger pan to rotate around wheel center and spin on release
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      "worklet";
      if (spinning.value === 1) return;
      const dx = e.x - RADIUS;
      const dy = e.y - RADIUS;
      startAngleDeg.value = (Math.atan2(dy, dx) * 180) / Math.PI;
      savedRotationDeg.value = rotation.value % 360;
    })
    .onUpdate((e) => {
      "worklet";
      if (spinning.value === 1) return;
      const current = (Math.atan2(e.y - RADIUS, e.x - RADIUS) * 180) / Math.PI;
      let delta = current - startAngleDeg.value;
      delta = ((delta + 540) % 360) - 180; // normalize to [-180,180]
      rotation.value = savedRotationDeg.value + delta;
    })
    .onEnd(() => {
      "worklet";
      if (spinning.value === 1) return;
      spinning.value = 1;
      runOnJS(setLocalSpinTrue)();

      const turns = 3 + Math.random() * 1.5;
      const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
      const panelCenter = targetPanel * panelAngle + panelAngle / 2;
      const base = rotation.value % 360;
      const targetDeg = base + turns * 360 + panelCenter;
      const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

      rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
        "worklet";
        if (!finished) return;
        const angle = (450 - (targetDeg % 360)) % 360;
        const seg = 360 / PANEL_COUNT;
        const index = Math.floor(angle / seg) % PANEL_COUNT;
        const rare = RARE_INDEXES.indexOf(index) !== -1;
        spinning.value = 0;
        runOnJS(handleHapticFeedback)();
        runOnJS(handleSpinComplete)(rare);
      });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, rotationGesture);

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
      <GestureDetector gesture={composedGesture}>
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
      </GestureDetector>

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
