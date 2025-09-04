import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SpinWheel from "../components/SpinWheel";
import BangerCard from "../components/BangerCard";
import { getRandomBanger, getRareBanger } from "../data/bangers";
import { Banger } from "../types/banger";

export default function SpinWheelScreen() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBanger, setSelectedBanger] = useState<Banger | null>(null);

  const handleSpinComplete = (isRare: boolean) => {
    setIsSpinning(false);
    const banger = isRare ? getRareBanger() : getRandomBanger();
    setSelectedBanger(banger);
  };

  const handleNewSpin = () => {
    setSelectedBanger(null);
    setIsSpinning(true);
  };



  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#8b5cf6", "#7c3aed"]}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-8">
            <Text className="text-white text-3xl font-bold text-center mb-2">
              Spin the Wheel
            </Text>
            <Text className="text-purple-100 text-center text-lg">
              Get a random banger or find a rare gem!
            </Text>
          </View>

          {/* Wheel */}
          {!selectedBanger && (
            <View className="items-center px-6 mb-8">
              <SpinWheel 
                onSpinComplete={handleSpinComplete}
                isSpinning={isSpinning}
              />
            </View>
          )}

          {/* Result */}
          {selectedBanger && (
            <View className="mb-8">
              <BangerCard 
                banger={selectedBanger} 
                showCategory={true}
              />
              
              {/* Spin Again Button */}
              <View className="px-6 mt-6">
                <View className="bg-white/20 rounded-2xl p-4">
                  <Text 
                    className="text-white text-center font-semibold text-lg"
                    onPress={handleNewSpin}
                  >
                    🎲 Spin Again
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Instructions */}
          {!selectedBanger && !isSpinning && (
            <View className="px-6 pb-8">
              <View className="bg-white/20 rounded-2xl p-4">
                <Text className="text-white text-center text-sm">
                  Spin the wheel to discover random bangers! 
                  {"\n"}Yellow segments give you rare bangers! ⭐
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}