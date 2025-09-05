import React, { useState, useRef } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SpinWheel, { SpinWheelHandle } from "../components/SpinWheel";
import { getDefaultSpinSections } from "../data/spinSections";
import BangerCard from "../components/BangerCard";
import { getRandomBanger, getRareBanger } from "../data/bangers";
import { Banger } from "../types/banger";
import { Ionicons } from "@expo/vector-icons";

export default function SpinWheelScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBanger, setSelectedBanger] = useState<Banger | null>(null);
  const wheelRef = useRef<SpinWheelHandle | null>(null);

  const handleSpinComplete = (isRare: boolean) => {
    setIsSpinning(false);
    const banger = isRare ? getRareBanger() : getRandomBanger();
    setSelectedBanger(banger);
  };


  const screenW = Dimensions.get("window").width;
  const wheelSize = Math.min(screenW * 1.35, 520);
  const viewportH = Math.round(wheelSize * 0.32); // Show only top 32% of wheel
  const pointerOffsetTop = 8; // keep pointer fully visible
  const wheelLiftPx = 15; // raise wheel ~15px

  return (
    <SafeAreaView className="flex-1" style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#0b0f19' }}>
        <LinearGradient
          colors={["#0b0f19", "#101828"]}
          className="flex-1"
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        <View style={{ flex: 1, paddingBottom: 32 }}>
          {/* Top controls */}
          <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>Wheel of Greg</Text>
            <View style={{ marginTop: 16 }} />
            <Pressable
              onPress={() => {
                if (wheelRef.current?.isBusy()) return;
                wheelRef.current?.startSpin();
              }}
              disabled={isSpinning}
              accessibilityRole="button"
              accessibilityLabel={selectedBanger ? "Spin Again" : "Spin the Wheel of Greg"}
              style={{
                alignSelf: 'center',
                backgroundColor: isSpinning ? '#9ca3af' : '#FF7A1A',
                paddingVertical: 14,
                paddingHorizontal: 28,
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Ionicons name={selectedBanger ? 'refresh' : 'sparkles'} size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '800', marginLeft: 8 }}>
                {selectedBanger ? "Spin Again" : isSpinning ? "Spinning..." : "Spin"}
              </Text>
            </Pressable>
          </View>

          {/* Middle content slot */}
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            {!selectedBanger && (
              <View style={{ backgroundColor: '#111827', borderColor: '#1f2937', borderWidth: 1, borderRadius: 16, padding: 16 }}>
                <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>Spin the Wheel of Greg</Text>
              </View>
            )}
            {selectedBanger && (
              <BangerCard banger={selectedBanger} showCategory={true} />
            )}
          </View>

          {/* Bottom wheel viewport (clipped) - positioned at bottom */}
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ height: viewportH, overflow: 'hidden', alignItems: 'center', marginBottom: wheelLiftPx }}>
              <SpinWheel
                ref={wheelRef as any}
                onSpinStart={() => setIsSpinning(true)}
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                sections={getDefaultSpinSections()}
                size={wheelSize}
                showButton={false}
                innerRadiusRatio={0.38}
                pointerOffsetTop={pointerOffsetTop}
              />
            </View>
          </View>
        </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
