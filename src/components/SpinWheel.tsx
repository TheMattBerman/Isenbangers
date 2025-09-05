import React, { useMemo, useRef, useCallback, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";
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
  polarToCartesian,
} from "../utils/spinWheelMath";

const { width } = Dimensions.get("window");

import { getDefaultSpinSections, SpinSection } from "../data/spinSections";

interface SpinWheelProps {
  onSpinComplete: (isRare: boolean) => void;
  isSpinning: boolean;
  onSpinStart?: () => void;
  sections?: SpinSection[];
  size?: number; // override wheel diameter
  showButton?: boolean; // show internal spin button
  innerRadiusRatio?: number; // 0..1, default 0.42
  pointerOffsetTop?: number; // px from container top, default -6
}

export type SpinWheelHandle = { startSpin: () => void; isBusy: () => boolean };
const SpinWheel = forwardRef<SpinWheelHandle, SpinWheelProps>(({ onSpinComplete, isSpinning, onSpinStart, sections = getDefaultSpinSections(), size, showButton = true, innerRadiusRatio = 0.42, pointerOffsetTop = -6 }, ref) => {
  // Dimensions based on prop size
  const screenW = width;
  const WHEEL_SIZE = size ?? Math.min(screenW * 1.2, 480);
  const RADIUS = WHEEL_SIZE / 2;
  const INNER_RADIUS = RADIUS * innerRadiusRatio;

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

  const setLocalSpinFalse = useCallback(() => {
    localSpinningRef.current = false;
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
  }, [panelAngle, RADIUS, INNER_RADIUS]);

  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);

  // Preload section images to avoid flashes
  useEffect(() => {
    try {
      sections.forEach((s) => {
        // @ts-ignore expo-image provides prefetch
        Image.prefetch?.(s.imageUri);
      });
    } catch {}
  }, [sections]);

  const bulbs = useMemo(() => {
    const cx = RADIUS;
    const cy = RADIUS;
    const outer = RADIUS * 0.98;
    return new Array(BULB_COUNT).fill(0).map((_, i) => {
      const angle = i * (360 / BULB_COUNT) - 90;
      const a = (angle * Math.PI) / 180;
      return { x: cx + outer * Math.cos(a), y: cy + outer * Math.sin(a) };
    });
  }, [RADIUS]);

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
    onSpinStart?.();
    setHighlightIdx(null);
    spinning.value = 1;

    const turns = 3 + Math.random() * 1.5; // 3 to 4.5 turns
    const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
    const panelCenter = targetPanel * panelAngle + panelAngle / 2;
    const base = rotation.value % 360;
    const targetDeg = base + turns * 360 + panelCenter;

    const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

    rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
      "worklet";
      if (!finished) {
        spinning.value = 0;
        runOnJS(setLocalSpinFalse)();
        return;
      }
      // Compute panel index and rarity inside worklet
      const angle = (450 - (targetDeg % 360)) % 360;
      const seg = 360 / PANEL_COUNT;
      const index = Math.floor(angle / seg) % PANEL_COUNT;
      const rare = RARE_INDEXES.indexOf(index) !== -1;
      spinning.value = 0;
      
      runOnJS(handleHapticFeedback)();
      runOnJS(setHighlightIdx)(index);
      runOnJS(handleSpinComplete)(rare);
    });
  };

  useImperativeHandle(ref, () => ({
    startSpin: () => {
      spin();
    },
    isBusy: () => {
      return localSpinningRef.current;
    },
  }));

  // Colors
  const rimOuter = "#D6D3CA";
  const rimInner = "#CFCBBF";
  const panelStart = "#2F3A52";
  const panelEnd = "#3C4B6E";

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
      if (onSpinStart) runOnJS(onSpinStart)();
      runOnJS(setHighlightIdx)(null);
      runOnJS(setLocalSpinTrue)();

      const turns = 3 + Math.random() * 1.5;
      const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
      const panelCenter = targetPanel * panelAngle + panelAngle / 2;
      const base = rotation.value % 360;
      const targetDeg = base + turns * 360 + panelCenter;
      const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

      rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
        "worklet";
        if (!finished) { spinning.value = 0; runOnJS(setLocalSpinFalse)(); return; }
        const angle = (450 - (targetDeg % 360)) % 360;
        const seg = 360 / PANEL_COUNT;
        const index = Math.floor(angle / seg) % PANEL_COUNT;
        const rare = RARE_INDEXES.indexOf(index) !== -1;
        spinning.value = 0;
        runOnJS(handleHapticFeedback)();
        runOnJS(setHighlightIdx)(index);
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
      if (onSpinStart) runOnJS(onSpinStart)();
      runOnJS(setHighlightIdx)(null);
      runOnJS(setLocalSpinTrue)();

      const turns = 3 + Math.random() * 1.5;
      const targetPanel = Math.floor(Math.random() * PANEL_COUNT);
      const panelCenter = targetPanel * panelAngle + panelAngle / 2;
      const base = rotation.value % 360;
      const targetDeg = base + turns * 360 + panelCenter;
      const easing = Easing.bezier(0.1, 0.8, 0.3, 1);

      rotation.value = withTiming(targetDeg, { duration: 2600, easing }, (finished) => {
        "worklet";
        if (!finished) { spinning.value = 0; runOnJS(setLocalSpinFalse)(); return; }
        const angle = (450 - (targetDeg % 360)) % 360;
        const seg = 360 / PANEL_COUNT;
        const index = Math.floor(angle / seg) % PANEL_COUNT;
        const rare = RARE_INDEXES.indexOf(index) !== -1;
        spinning.value = 0;
        runOnJS(handleHapticFeedback)();
        runOnJS(setHighlightIdx)(index);
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
          top: pointerOffsetTop,
          zIndex: 10,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderTopWidth: 28,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "#9ca3af",
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
                  <Circle cx={b.x} cy={b.y} r={5} color="#FFE79A">
                    <BlurMask blur={8} style="normal" />
                  </Circle>
                  <Circle cx={b.x} cy={b.y} r={3} color="#FFF2C2" />
                </Group>
              ))}
            </Group>

            {/* Center hub */}
            <Group>
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.6} color="#0b0f19" />
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.45} color="#111827" />
            </Group>
          </Canvas>

          {/* Section avatars */}
          {sections.map((s, i) => {
            const mid = i * panelAngle + panelAngle / 2 - 90; // center angle
            const outer = RADIUS * 0.82;
            const inner = INNER_RADIUS + 12;
            const rMid = (outer + inner) / 2;
            const thickness = outer - inner;
            const size = Math.max(56, Math.min(84, thickness * 0.9));
            const center = polarToCartesian(RADIUS, RADIUS, rMid, mid);
            const left = center.x - size / 2;
            const top = center.y - size / 2;
            const isHighlight = highlightIdx === i;
            return (
              <View key={s.id}
                pointerEvents="none"
                style={{ position: "absolute", left, top, width: size, height: size, alignItems: "center", justifyContent: "center" }}
              >
                <View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFFFFF" }} />
                <Image
                  source={{ uri: s.imageUri }}
                  style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2, transform: [{ scale: isHighlight ? 1.06 : 1 }] }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>

      {/* Spin Button (optional) */}
      {showButton && (
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
            backgroundColor: isSpinning || localSpinningRef.current ? "#9ca3af" : "#FF7A1A",
          }}
        >
          <Ionicons name="refresh" size={22} color="white" />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16, marginLeft: 8 }}>
            {isSpinning ? "Spinning..." : "Spin"}
          </Text>
        </Pressable>
      )}
    </View>
  );
});
export default SpinWheel;
