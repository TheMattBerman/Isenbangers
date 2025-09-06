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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  Path,
  Circle,
  Group,
  SweepGradient,
  RadialGradient,
  vec,
  BlurMask,
} from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
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
    const outer = RADIUS * 0.965; // keep inside canvas, leave room for halo
    return new Array(BULB_COUNT).fill(0).map((_, i) => {
      const angle = i * (360 / BULB_COUNT) - 90;
      const a = (angle * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      return { x: cx + outer * ux, y: cy + outer * uy, ux, uy, angle };
    });
  }, [RADIUS]);

  // Animated marquee glow for bulbs (lightweight interval)
  const [bulbAnimT, setBulbAnimT] = useState(0);
  const bulbPhase = useMemo(() => new Array(BULB_COUNT).fill(0).map(() => Math.random() * Math.PI * 2), []);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.06; // ~16 steps per second
      setBulbAnimT(t);
    }, 60);
    return () => clearInterval(id);
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

  // Keep avatars upright relative to screen by counter-rotating
  const keepUprightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }],
  }));

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
  const rimOuter = "#8892A2"; // brushed metal outer
  const rimMid = "#A4ACBA";
  const rimInner = "#D1D5DB";
  const panelStart = "#1B2540"; // deep navy
  const panelEnd = "#2A3B6A";
  const panelAltStart = "#202A49";
  const panelAltEnd = "#334877";
  const dividerColor = "rgba(255,255,255,0.12)";

  // Clip path to prevent blurs/halos from bleeding outside the wheel
  const clipPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(RADIUS, RADIUS, RADIUS * 0.999);
    return p;
  }, [RADIUS]);

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
        {/* Hinge */}
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#E5E7EB",
            borderWidth: 1,
            borderColor: "#D1D5DB",
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 14,
            borderRightWidth: 14,
            borderTopWidth: 28,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "#CBD5E1",
          }}
        />
      </View>

      {/* Wheel */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width: WHEEL_SIZE, height: WHEEL_SIZE }, animatedStyle]}>
          <Canvas style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            {/* Hard clip to circle to ensure nothing renders outside the rim */}
            <Group clip={clipPath}>
            {/* Rim */}
            <Group>
              {/* Outer metallic ring */}
              <Circle cx={RADIUS} cy={RADIUS} r={RADIUS} color={rimOuter} />
              <Circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.97} color={rimMid} />
              <Circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.94} color={rimInner} />
              {/* Inner bevel shadow */}
              <Circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.915} color="#00000020" />
            </Group>

            {/* Panels */}
            {segments.map(({ path, index }) => (
              <Group key={index}>
                <Path path={path} color={index % 2 === 0 ? panelEnd : panelAltEnd}>
                  <SweepGradient
                    c={vec(RADIUS, RADIUS)}
                    colors={index % 2 === 0 ? [panelStart, panelEnd] : [panelAltStart, panelAltEnd]}
                    positions={[0, 1]}
                  />
                </Path>
                {/* Subtle sheen per panel */}
                <Path path={path} color="rgba(255,255,255,0.05)" />
              </Group>
            ))}

            {/* Panel dividers */}
            <Group>
              {new Array(PANEL_COUNT).fill(0).map((_, i) => {
                const start = i * panelAngle - 90;
                const p1 = polarToCartesian(RADIUS, RADIUS, RADIUS * 0.94, start);
                const p2 = polarToCartesian(RADIUS, RADIUS, Math.max(INNER_RADIUS - 2, 0), start);
                const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
                return (
                  <Path key={`divider-${i}`} path={d} color={dividerColor} style="stroke" strokeWidth={1} />
                );
              })}
            </Group>

            {/* Removed broad canvas highlight to prevent geometry artifacts */}

            {/* Bulbs */}
            <Group>
              {bulbs.map((b, i) => {
                // marquee wave + occasional twinkle
                let wave = Math.max(0, Math.sin(bulbAnimT * 2.0 + bulbPhase[i] + i * 0.5));
                const twinkle = ((Math.floor(bulbAnimT * 3) + i) % 6 === 0) ? 0.25 : 0;
                const intensity = Math.min(1.2, 0.7 + 0.45 * wave + twinkle); // 0.7..~1.2
                const outerAlpha = 0.65 * intensity;
                const midAlpha = 0.9 * intensity;
                const coreAlpha = 1.0 * Math.min(1, intensity);
                const glowRadius = 10 + 3 * intensity;
                const midRadius = 6 + 1.1 * intensity;
                const coreRadius = 3.6 + 0.6 * intensity;
                // small fixture stem
                const stemLen = 8;
                const stemBackX = b.x - b.ux * (coreRadius + 3);
                const stemBackY = b.y - b.uy * (coreRadius + 3);
                const stemFrontX = stemBackX - b.ux * stemLen;
                const stemFrontY = stemBackY - b.uy * stemLen;
                const stemPath = `M ${stemBackX} ${stemBackY} L ${stemFrontX} ${stemFrontY}`;
                return (
                  <Group key={i}>
                    {/* Socket bezel for contrast */}
                    <Circle cx={b.x} cy={b.y} r={glowRadius + 2} color="#0A0F1A" />
                    {/* Fixture stem */}
                    <Path path={stemPath} color="#94A3B8" style="stroke" strokeWidth={2} />
                    {/* Outer halo */}
                    <Circle cx={b.x} cy={b.y} r={glowRadius} color={`rgba(255,187,92,${(outerAlpha*0.75).toFixed(3)})`}>
                      <BlurMask blur={14} style="normal" />
                    </Circle>
                    {/* Mid glow with warm gradient */}
                    <Circle cx={b.x} cy={b.y} r={midRadius} color={`rgba(255,231,154,${midAlpha.toFixed(3)})`}>
                      <RadialGradient
                        c={vec(b.x, b.y)}
                        r={midRadius}
                        colors={[`rgba(255,250,230,${midAlpha.toFixed(3)})`, `rgba(255,180,70,${(0.6*midAlpha).toFixed(3)})`]}
                      />
                    </Circle>
                    {/* Core glass */}
                    <Circle cx={b.x} cy={b.y} r={coreRadius} color={`rgba(255,246,210,${coreAlpha.toFixed(3)})`} />
                    {/* Glass rim highlight */}
                    <Circle cx={b.x} cy={b.y} r={coreRadius + 1.2} color="rgba(255,255,255,0.35)" style="stroke" strokeWidth={0.8} />
                    {/* Specular dot */}
                    <Circle cx={b.x - coreRadius * 0.35} cy={b.y - coreRadius * 0.45} r={coreRadius * 0.38} color={`rgba(255,255,255,${(0.9*wave + 0.2).toFixed(3)})`}>
                      <BlurMask blur={2.2} style="normal" />
                    </Circle>
                  </Group>
                );
              })}
            </Group>

            {/* Center hub */}
            <Group>
              {/* glow */}
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.68} color="#0b0f19">
                <BlurMask blur={6} style="normal" />
              </Circle>
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.62} color="#0F172A" />
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.52} color="#111827" />
              {/* glossy center */}
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.45} color="#0B1220" />
              <Circle cx={RADIUS} cy={RADIUS} r={INNER_RADIUS * 0.45} color="#0B1220">
                <RadialGradient
                  c={vec(RADIUS, RADIUS - INNER_RADIUS * 0.12)}
                  r={INNER_RADIUS * 0.45}
                  colors={["#1F2937", "#0B1220"]}
                />
              </Circle>
            </Group>
            </Group>
          </Canvas>

          {/* Section avatars (kept upright) */}
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
              <Animated.View key={s.id}
                pointerEvents="none"
                style={[{ position: "absolute", left, top, width: size, height: size, alignItems: "center", justifyContent: "center" }, keepUprightStyle]}
              >
                {/* Ring with glow */}
                <LinearGradient
                  colors={isHighlight ? ["#FFE79A", "#FFB84D"] : ["#1F2937", "#0B1220"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: isHighlight ? "#FFD56A" : "#000",
                    shadowOpacity: isHighlight ? 0.7 : 0.25,
                    shadowRadius: isHighlight ? 14 : 6,
                    shadowOffset: { width: 0, height: 3 },
                  }}
                >
                  <View style={{ width: size - 6, height: size - 6, borderRadius: (size - 6) / 2, backgroundColor: "#0B1220", alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: size - 10, height: size - 10, borderRadius: (size - 10) / 2, backgroundColor: "#111827" }} />
                  </View>
                </LinearGradient>
                <Image
                  source={{ uri: s.imageUri }}
                  style={{ width: size - 12, height: size - 12, borderRadius: (size - 12) / 2, transform: [{ scale: isHighlight ? 1.06 : 1 }] }}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
              </Animated.View>
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
