import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import Animated, { cancelAnimation, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface AudioMiniPlayerProps {
  text: string;
}

// Helper to safely stop any speaking
async function stopSpeaking() {
  try {
    await Speech.stop();
  } catch {}
}

export default function AudioMiniPlayer({ text }: AudioMiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [didFinish, setDidFinish] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Progress as fraction 0..1
  const progress = useSharedValue(0);
  const targetPreview = useSharedValue<number | null>(null); // while scrubbing
  const playScale = useSharedValue(1);
  const reduce = useReducedMotion();

  const totalChars = useMemo(() => text.length, [text]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Drive simple looped wave ring animation while playing
  const ringProg1 = useSharedValue(0);
  const ringProg2 = useSharedValue(0);
  const ringProg3 = useSharedValue(0);

  useEffect(() => {
    if (isPlaying && !reduce) {
      ringProg1.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
      ringProg2.value = withRepeat(withTiming(1, { duration: 1600, }), -1, false);
      ringProg3.value = withRepeat(withTiming(1, { duration: 1600, }), -1, false);
    } else {
      cancelAnimation(ringProg1);
      cancelAnimation(ringProg2);
      cancelAnimation(ringProg3);
      ringProg1.value = 0;
      ringProg2.value = 0;
      ringProg3.value = 0;
    }
    return () => {
      cancelAnimation(ringProg1);
      cancelAnimation(ringProg2);
      cancelAnimation(ringProg3);
    };
  }, [isPlaying, reduce]);

  const ringStyle = (p: Animated.SharedValue<number>, delay: number) => {
    return useAnimatedStyle(() => {
      const t = p.value;
      // create phased waves using a simple threshold trick
      const phase = Math.max(0, t - delay);
      const opacity = isPlaying ? (phase < 1 ? 0.25 * (1 - phase) : 0) : 0.1;
      const scale = 1 + 0.6 * phase;
      return { opacity, transform: [{ scale }] } as any;
    });
  };

  const ring1Style = ringStyle(ringProg1, 0.0);
  const ring2Style = ringStyle(ringProg2, 0.2);
  const ring3Style = ringStyle(ringProg3, 0.4);

  // Progress bar animated width
  const progressStyle = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, targetPreview.value ?? progress.value)) * 100}%` }));

  // Track estimated progress if platform boundary events are not reliable
  const tickTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTick = () => {
    if (tickTimer.current) {
      clearInterval(tickTimer.current);
      tickTimer.current = null;
    }
  };

  const startEstimateTicks = () => {
    clearTick();
    // simple heuristic: 150 wpm -> 2.5 words/sec; estimate 5 chars per word
    const charsPerSec = 2.5 * 5; // 12.5
    tickTimer.current = setInterval(() => {
      progress.value = Math.min(1, progress.value + charsPerSec / Math.max(1, totalChars));
    }, 250);
  };

  const speakFrom = useCallback(async (charOffset: number) => {
    setDidFinish(false);
    await stopSpeaking();
    const slice = text.slice(Math.max(0, Math.min(totalChars - 1, charOffset)));
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    progress.value = Math.max(0, Math.min(1, charOffset / Math.max(1, totalChars)));

    // fallbacks via estimation if boundary events are not emitted
    startEstimateTicks();

    Speech.speak(slice, {
      rate: 0.9,
      pitch: 1.0,
      onStart: () => {
        // reset estimate if needed
      },
      onBoundary: (ev: any) => {
        // ev.charIndex is available on web/iOS; guard usage
        const localIndex: number | undefined = (ev && (ev.charIndex as number)) ?? undefined;
        if (typeof localIndex === "number") {
          const globalIndex = Math.min(totalChars, charOffset + localIndex);
          progress.value = Math.max(0, Math.min(1, globalIndex / Math.max(1, totalChars)));
        }
      },
      onDone: () => {
        clearTick();
        progress.value = 1;
        setIsPlaying(false);
        setDidFinish(true);
      },
      onStopped: () => {
        clearTick();
        setIsPlaying(false);
      },
      onError: () => {
        clearTick();
        setIsPlaying(false);
      },
    });
  }, [text, totalChars]);

  const handleToggle = async () => {
    if (isPlaying) {
      await stopSpeaking();
      setIsPlaying(false);
      Haptics.selectionAsync();
      return;
    }
    speakFrom(0);
  };

  // Gestures: long-press to enter scrub preview, pan to adjust, release to seek
  const isScrubbing = useSharedValue(false);

  const longPress = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isScrubbing.value = true;
      runOnJS(Haptics.selectionAsync)();
      targetPreview.value = progress.value;
    })
    .onEnd((_e, success) => {
      if (!success) {
        isScrubbing.value = false;
        targetPreview.value = null;
      }
    });

  const pan = Gesture.Pan()
    .enabled(true)
    .onUpdate((e) => {
      if (!containerWidth) return;
      const dx = e.translationX;
      const basePx = (targetPreview.value ?? progress.value) * containerWidth;
      const clamped = Math.max(0, Math.min(containerWidth, basePx + dx));
      const next = clamped / containerWidth;
      targetPreview.value = next;
    })
    .onEnd(() => {
      const t = targetPreview.value;
      if (t == null) return;
      isScrubbing.value = false;
      const offset = Math.floor(t * totalChars);
      targetPreview.value = null;
      runOnJS(speakFrom)(offset);
    })
    .simultaneousWithExternalGesture(longPress);

  const composed = Gesture.Simultaneous(longPress, pan);

  const playScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: playScale.value }] }));

  return (
    <View onLayout={onLayout} style={{ width: "100%", alignItems: "center" }}>
      <GestureDetector gesture={composed}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause audio" : "Play audio"}
          onPressIn={() => { playScale.value = withTiming(0.96, { duration: 90 }); }}
          onPressOut={() => { playScale.value = withTiming(1, { duration: 120 }); }}
          onPress={handleToggle}
          hitSlop={12}
          style={{ alignItems: "center" }}
        >
          <View style={{ width: 72, height: 72, alignItems: "center", justifyContent: "center" }}>
            {/* Wave rings */}
            <Animated.View style={[{ position: "absolute", width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF7A1A" }, ring1Style]} />
            <Animated.View style={[{ position: "absolute", width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF7A1A" }, ring2Style]} />
            <Animated.View style={[{ position: "absolute", width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF7A1A" }, ring3Style]} />

            {/* Button */}
            <Animated.View style={[playScaleStyle, { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: "#FFD3B0", overflow: "hidden", shadowColor: "#FF7A1A", shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, alignItems: "center", justifyContent: "center" }]}> 
              <LinearGradient colors={["#FF8C33", "#FF7A1A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", inset: 0, borderRadius: 32 }} />
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" />
            </Animated.View>
          </View>
        </Pressable>
      </GestureDetector>

      {/* Progress bar */}
      <View style={{ width: 160, marginTop: 8 }}>
        <View style={{ height: 1, backgroundColor: "#E6E3DA", borderRadius: 999, overflow: "hidden" }}>
          <Animated.View style={[{ height: 1, backgroundColor: "#FF7A1A" }, progressStyle]} />
        </View>
      </View>

      {/* Replay after finish */}
      {didFinish ? (
        <Pressable onPress={() => speakFrom(0)} style={{ marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#FFD3B0", backgroundColor: "#FFF" }}>
          <Text style={{ color: "#FF7A1A", fontSize: 12, fontWeight: "600" }}>Replay</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
