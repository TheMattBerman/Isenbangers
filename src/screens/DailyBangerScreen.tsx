import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import BangerCard from "../components/BangerCard";
import { getTodaysBanger } from "../data/bangers";
import { useAppStore } from "../state/appStore";
import StreakModal, { buildWeekRow } from "../components/StreakModal";

export default function DailyBangerScreen() {
  const todaysBanger = getTodaysBanger();
  const { 
    currentStreak, 
    incrementStreak, 
    markDailyBangerViewed, 
    incrementTotalViewed,
    lastDailyBangerDate,
    lastViewedDate,
    lastStreakShownDate,
    setLastStreakShownToday,
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

  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [streakMode, setStreakMode] = useState<"earned" | "lost">("earned");
  const [streakCountForModal, setStreakCountForModal] = useState(0);
  const [openedManually, setOpenedManually] = useState(false);
  const week = useMemo(() => buildWeekRow(streakCountForModal, new Date().getDay()), [streakCountForModal]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDailyBangerDate === today) return;

    // Evaluate before mutating state
    const prevStreak = currentStreak;
    const prevLastViewed = lastViewedDate;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toDateString();

    let mode: "earned" | "lost" = "earned";
    if (prevLastViewed && prevLastViewed !== yesterday) {
      if (prevLastViewed !== today) mode = prevStreak > 0 ? "lost" : "earned";
    }

    // Update counters for today
    incrementStreak();
    markDailyBangerViewed();
    incrementTotalViewed();

    if (lastStreakShownDate !== today) {
      const newStreak = mode === "lost" ? prevStreak : prevStreak + 1;
      setStreakCountForModal(mode === "lost" ? prevStreak : newStreak);
      setStreakMode(mode);
      setOpenedManually(false);
      setStreakModalVisible(true);
    }
  }, []);

  const openStreakDetails = () => {
    setOpenedManually(true);
    setStreakMode("earned");
    setStreakCountForModal(currentStreak);
    setStreakModalVisible(true);
    Haptics.selectionAsync();
  };



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
          <Pressable
            onPress={openStreakDetails}
            accessibilityRole="button"
            accessibilityLabel="View streak details"
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
            <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 6, fontSize: 12 }}>Tap to view</Text>
          </Pressable>

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
         {/* Streak Modal */}
         <StreakModal
           visible={streakModalVisible}
           mode={streakMode}
           streakCount={streakCountForModal}
           week={week}
           onContinue={() => { setStreakModalVisible(false); if (!openedManually) setLastStreakShownToday(); setOpenedManually(false); }}
         />
         </ScrollView>
         </LinearGradient>
       </View>
     </SafeAreaView>
   );
}