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

  // Debug state is visible in UI; remove noisy logs.

  // Validate data
  if (!todaysBanger) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 18 }}>Error: No banger data available</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDailyBangerDate !== today) {
      incrementStreak();
      markDailyBangerViewed();
      incrementTotalViewed();
    }
  }, []);



  return (
    <SafeAreaView 
      className="flex-1"
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#F5F3EE' }}>
        <LinearGradient
          colors={["#FFFFFF", "#F5F3EE"]}
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
              className="text-3xl font-bold text-center mb-2"
              style={{
                color: '#111111',
                fontSize: 32,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Today's Banger
            </Text>
            <Text 
              className="text-center text-lg"
              style={{
                color: '#6B7280',
                textAlign: 'center',
                fontSize: 18,
              }}
            >
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </Text>
          </View>

          {/* Streak Counter */}
          <View 
            className="mx-6 mb-6 rounded-2xl p-4"
            style={{
              marginHorizontal: 24,
              marginBottom: 24,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E6E3DA',
            }}
          >
            <View 
              className="flex-row items-center justify-center"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text 
                className="text-lg font-semibold"
                style={{
                  color: '#111111',
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                🔥 {currentStreak} Day Streak
              </Text>
            </View>
          </View>

          {/* Banger Card */}
          <View 
            className="mb-8"
            style={{ marginBottom: 32 }}
          >
            <BangerCard 
              banger={todaysBanger} 
              showCategory={true}
            />
          </View>

          {/* Motivational Footer */}
          <View 
            className="px-6 pb-8"
            style={{
              paddingHorizontal: 24,
              paddingBottom: 32,
            }}
          >
            <Text 
              className="text-white/80 text-center text-sm"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                fontSize: 12,
              }}
            >
              Come back tomorrow for another banger! 🚀
            </Text>
          </View>
        </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}