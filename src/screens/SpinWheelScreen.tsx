import React, { useState, useRef } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import SpinWheel, { SpinWheelHandle } from "../components/SpinWheel";
import { getDefaultSpinSections } from "../data/spinSections";
import BangerCard from "../components/BangerCard";
import { getRandomBanger, getRareBanger } from "../data/bangers";
import { Banger } from "../types/banger";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../state/appStore";

export default function SpinWheelScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBanger, setSelectedBanger] = useState<Banger | null>(null);
  const wheelRef = useRef<SpinWheelHandle | null>(null);
  const { currentStreak } = useAppStore();

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
    <SafeAreaView 
      className="flex-1"
      style={{ flex: 1 }}
      edges={["left","right"]}
    >
      <View style={{ flex: 1, backgroundColor: "#FFF7EF" }}>
        <LinearGradient
          colors={["#FFF9F4", "#FFF3E8"]}
          className="flex-1"
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24, paddingTop: 60 }}
        >
          {/* Header with streak pill */}
          <View 
            className="px-6 py-8"
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <Text 
              className="text-3xl font-bold text-center mb-2"
              style={{
                color: '#111111',
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Spin Wheel
            </Text>
            <Text 
              className="text-center text-lg"
              style={{
                color: '#6B7280',
                textAlign: 'center',
                fontSize: 16,
              }}
            >
              Discover random bangers from Greg
            </Text>
            {(() => { 
              const pillScale = useSharedValue(1); 
              const pillStyle = useAnimatedStyle(() => ({ 
                transform: [{ scale: pillScale.value }] 
              }));
              return (
                <Animated.View style={[pillStyle, { position: 'absolute', top: 16, right: 24 }]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: 12,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: '#E6E3DA',
                      shadowColor: '#000000',
                      shadowOpacity: 0.08,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Ionicons name="flame" size={16} color="#FF7A1A" />
                    <Text style={{ marginLeft: 6, color: '#111111', fontWeight: '700' }}>{currentStreak}</Text>
                  </View>
                </Animated.View>
              ); 
            })()}
          </View>

          {/* Hero Content Area - matches Today page structure */}
          <View style={{ flex: 1, justifyContent: "center", paddingTop: 8, paddingHorizontal: 24 }}>
            <View style={{ marginBottom: 32 }}>
              {/* Spin Button positioned prominently */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Pressable
                  onPress={() => {
                    if (wheelRef.current?.isBusy()) return;
                    wheelRef.current?.startSpin();
                  }}
                  disabled={isSpinning}
                  accessibilityRole="button"
                  accessibilityLabel={selectedBanger ? "Spin Again" : "Spin the Wheel of Greg"}
                  style={{
                    backgroundColor: isSpinning ? '#9ca3af' : '#FF7A1A',
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    borderRadius: 9999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000000',
                    shadowOpacity: 0.12,
                    shadowRadius: 24,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
                  }}
                >
                  <Ionicons name={selectedBanger ? 'refresh' : 'sparkles'} size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', marginLeft: 10, fontSize: 16 }}>
                    {selectedBanger ? "Spin Again" : isSpinning ? "Spinning..." : "Spin the Wheel"}
                  </Text>
                </Pressable>
              </View>

              {/* Content Card */}
              {!selectedBanger && (
                <View style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 24,
                  padding: 32,
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 24,
                  elevation: 8,
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                      color: '#374151', 
                      textAlign: 'center', 
                      fontSize: 18, 
                      fontWeight: '600',
                      marginBottom: 8
                    }}>
                      Ready to discover wisdom?
                    </Text>
                    <Text style={{ 
                      color: '#6B7280', 
                      textAlign: 'center', 
                      fontSize: 15, 
                      lineHeight: 22
                    }}>
                      Every spin reveals a carefully curated banger from Greg's collection
                    </Text>
                  </View>
                </View>
              )}
              {selectedBanger && (
                <BangerCard banger={selectedBanger} showCategory={true} />
              )}
            </View>
          </View>

          {/* Footer with wheel and warm background */}
          <View style={{ 
            paddingBottom: 32, 
            backgroundColor: "#F9F3F0",
            marginHorizontal: -24, 
            paddingHorizontal: 24,
            paddingTop: 16,
            borderRadius: 24,
            marginTop: 16
          }}>
            {/* Info text above wheel */}
            <View style={{ paddingBottom: 16, alignItems: 'center' }}>
              <Text style={{ 
                color: "#6B7280", 
                textAlign: "center", 
                fontSize: 14,
                fontWeight: '500'
              }}>
                {selectedBanger ? "Spin again for another banger" : "Give the wheel a spin"}
              </Text>
            </View>

            {/* Bottom wheel viewport (clipped) */}
            <View style={{ justifyContent: 'flex-end' }}>
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
        </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
