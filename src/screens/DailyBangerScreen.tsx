import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import BangerCard from "../components/BangerCard";
import { getTodaysBanger } from "../data/bangers";
import { useAppStore } from "../state/appStore";

export default function DailyBangerScreen() {
  const todaysBanger = getTodaysBanger();
  const { 
    currentStreak, 
    incrementStreak, 
    markDailyBangerViewed, 
    incrementTotalViewed,
    lastDailyBangerDate 
  } = useAppStore();

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDailyBangerDate !== today) {
      incrementStreak();
      markDailyBangerViewed();
      incrementTotalViewed();
    }
  }, []);



  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#f97316", "#ea580c"]}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-8">
            <Text className="text-white text-3xl font-bold text-center mb-2">
              Today's Banger
            </Text>
            <Text className="text-orange-100 text-center text-lg">
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </Text>
          </View>

          {/* Streak Counter */}
          <View className="mx-6 mb-6 bg-white/20 rounded-2xl p-4">
            <View className="flex-row items-center justify-center">
              <Text className="text-white text-lg font-semibold">
                🔥 {currentStreak} Day Streak
              </Text>
            </View>
          </View>

          {/* Banger Card */}
          <View className="mb-8">
            <BangerCard 
              banger={todaysBanger} 
              showCategory={true}
            />
          </View>

          {/* Motivational Footer */}
          <View className="px-6 pb-8">
            <Text className="text-white/80 text-center text-sm">
              Come back tomorrow for another banger! 🚀
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}