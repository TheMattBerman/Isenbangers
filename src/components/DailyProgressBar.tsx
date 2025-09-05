import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

interface DailyProgressBarProps {
  startAtMs: number;
  endAtMs: number;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function DailyProgressBar({ startAtMs, endAtMs }: DailyProgressBarProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000); // update every 60s
    return () => clearInterval(id);
  }, []);

  const progress = useMemo(() => {
    const total = Math.max(1, endAtMs - startAtMs);
    return clamp01((now - startAtMs) / total);
  }, [now, startAtMs, endAtMs]);

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
      <View style={{ height: 4, borderRadius: 999, backgroundColor: "#F2EFE7", overflow: "hidden" }}>
        <View style={{ width: `${progress * 100}%`, height: 4, backgroundColor: "#FF7A1A" }} />
      </View>
    </View>
  );
}
