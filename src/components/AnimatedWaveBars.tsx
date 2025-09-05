import React, { useEffect, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface AnimatedWaveBarsProps {
  active: boolean;
  barCount?: number;
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export default function AnimatedWaveBars({
  active,
  barCount = 7,
  width = 64,
  height = 28,
  color = "#C084FC", // lavender neon
  style,
}: AnimatedWaveBarsProps) {
  const bars = useMemo(() => new Array(barCount).fill(0).map((_, i) => i), [barCount]);
  const progresses = useMemo(() => bars.map(() => useSharedValue(0)), [bars.length]);

  useEffect(() => {
    progresses.forEach((p, idx) => {
      if (active) {
        // staggered start per bar
        const start = () => {
          p.value = withRepeat(withTiming(1, { duration: 700 + idx * 40 }), -1, true);
        };
        const t = setTimeout(start, idx * 70);
        return () => clearTimeout(t);
      } else {
        cancelAnimation(p);
        p.value = 0;
      }
    });
  }, [active]);

  const barWidth = Math.max(2, Math.floor(width / (barCount * 1.4)));
  const gap = Math.max(2, Math.floor(barWidth * 0.6));

  return (
    <View style={[{ width, height, flexDirection: "row", alignItems: "flex-end", justifyContent: "center" }, style]}> 
      {bars.map((i) => {
        const progress = progresses[i];
        const stylez = useAnimatedStyle(() => {
          const h = interpolate(progress.value, [0, 1], [height * 0.25, height], Extrapolation.CLAMP);
          const opacity = interpolate(progress.value, [0, 1], [0.6, 1], Extrapolation.CLAMP);
          return {
            height: h,
            opacity,
          };
        });
        return (
          <Animated.View
            key={`bar-${i}`}
            style={[
              {
                width: barWidth,
                marginHorizontal: gap / 2,
                backgroundColor: color,
                borderRadius: 999,
                shadowColor: color,
                shadowOpacity: 0.8,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
              },
              stylez,
            ]}
          />
        );
      })}
    </View>
  );
}
