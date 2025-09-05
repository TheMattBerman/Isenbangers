import React, { useEffect, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
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

function WaveBar({
  index,
  total,
  progress,
  barWidth,
  gap,
  height,
  color,
}: {
  index: number;
  total: number;
  progress: Animated.SharedValue<number>;
  barWidth: number;
  gap: number;
  height: number;
  color: string;
}) {
  const stylez = useAnimatedStyle(() => {
    "worklet";
    const phase = (index / total) * Math.PI * 2;
    const s = Math.abs(Math.sin(progress.value * Math.PI * 2 + phase)); // 0..1
    const h = height * (0.28 + 0.6 * s);
    return {
      height: h,
      opacity: 0.6 + 0.4 * s,
    };
  });

  return (
    <Animated.View
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
}

export default function AnimatedWaveBars({
  active,
  barCount = 7,
  width = 64,
  height = 28,
  color = "#FF7A1A",
  style,
}: AnimatedWaveBarsProps) {
  const indexes = useMemo(() => Array.from({ length: barCount }, (_, i) => i), [barCount]);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withRepeat(withTiming(1, { duration: 900 }), -1, false);
    } else {
      cancelAnimation(progress);
      progress.value = 0;
    }
    return () => cancelAnimation(progress);
  }, [active]);

  const barWidth = Math.max(2, Math.floor(width / (barCount * 1.4)));
  const gap = Math.max(2, Math.floor(barWidth * 0.6));

  return (
    <View style={[{ width, height, flexDirection: "row", alignItems: "flex-end", justifyContent: "center" }, style]}>
      {indexes.map((i) => (
        <WaveBar
          key={`bar-${i}`}
          index={i}
          total={barCount}
          progress={progress}
          barWidth={barWidth}
          gap={gap}
          height={height}
          color={color}
        />
      ))}
    </View>
  );
}
