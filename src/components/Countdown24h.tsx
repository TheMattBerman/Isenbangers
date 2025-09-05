import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text } from "react-native";

function formatHHMMSS(msRemaining: number) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

interface Countdown24hProps {
  endAtMs: number;
  onEnd?: () => void;
}

export default function Countdown24h({ endAtMs, onEnd }: Countdown24hProps) {
  const [now, setNow] = useState(Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, endAtMs - now);

  useEffect(() => {
    if (remaining <= 0 && !endedRef.current) {
      endedRef.current = true;
      onEnd && onEnd();
    }
  }, [remaining]);

  const label = useMemo(() => {
    if (remaining <= 0) return "New banger unlocked 🎉";
    return `Next daily in ${formatHHMMSS(remaining)}`;
  }, [remaining]);

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E6E3DA",
          borderRadius: 999,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ color: "#111111", fontSize: 12, fontWeight: "600" }}>{label}</Text>
      </View>
    </View>
  );
}
