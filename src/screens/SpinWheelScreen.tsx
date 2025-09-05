import React, { useState, useRef } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SpinWheel from "../components/SpinWheel";
import { getDefaultSpinSections } from "../data/spinSections";
import BangerCard from "../components/BangerCard";
import { getRandomBanger, getRareBanger } from "../data/bangers";
import { Banger } from "../types/banger";

type WheelHandle = { startSpin: () => void; isBusy: () => boolean };
export default function SpinWheelScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBanger, setSelectedBanger] = useState<Banger | null>(null);
  const wheelRef = useRef<WheelHandle | null>(null);

  const handleSpinComplete = (isRare: boolean) => {
    setIsSpinning(false);
    const banger = isRare ? getRareBanger() : getRandomBanger();
    setSelectedBanger(banger);
  };

  const handleNewSpin = () => {
    setSelectedBanger(null);
    setTimeout(() => {
      wheelRef.current?.startSpin();
    }, 50);
  };



  return (
    <SafeAreaView 
      className="flex-1"
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#8b5cf6' }}>
        <LinearGradient
          colors={["#8b5cf6", "#7c3aed"]}
          className="flex-1"
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View 
            className="px-6 py-8"
            style={{
              paddingHorizontal: 24,
              paddingVertical: 32,
            }}
          >
            <Text 
              className="text-white text-3xl font-bold text-center mb-2"
              style={{
                color: 'white',
                fontSize: 32,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Spin the Wheel
            </Text>
            <Text 
              className="text-purple-100 text-center text-lg"
              style={{
                color: '#e9d5ff',
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              Get a random banger or find a rare gem!
            </Text>
          </View>

          {/* Wheel */}
          {!selectedBanger && (
            <View 
              className="items-center px-6 mb-8"
              style={{
                alignItems: 'center',
                paddingHorizontal: 24,
                marginBottom: 32,
              }}
            >
              <SpinWheel 
                ref={wheelRef as any}
                onSpinStart={() => setIsSpinning(true)}
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
                sections={getDefaultSpinSections()}
              />
            </View>
          )}

          {/* Result */}
          {selectedBanger && (
            <View 
              className="mb-8"
              style={{ marginBottom: 32 }}
            >
              <BangerCard 
                banger={selectedBanger} 
                showCategory={true}
              />
              
              {/* Spin Again Button */}
              <View 
                className="px-6 mt-6"
                style={{
                  paddingHorizontal: 24,
                  marginTop: 24,
                }}
              >
                <Pressable
                  onPress={handleNewSpin}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <Text 
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: 18,
                    }}
                  >
                    🎲 Spin Again
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Instructions */}
          {!selectedBanger && !isSpinning && (
            <View 
              className="px-6 pb-8"
              style={{
                paddingHorizontal: 24,
                paddingBottom: 32,
              }}
            >
              <View 
                className="bg-white/20 rounded-2xl p-4"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text 
                  className="text-white text-center text-sm"
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  Spin the wheel to discover random bangers!
                  {"\n"}Use one finger to rotate or tap Spin.
                  {"\n"}Yellow segments give you rare bangers! ⭐
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}