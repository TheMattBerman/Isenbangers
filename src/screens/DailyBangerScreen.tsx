import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import BangerCard from "../components/BangerCard";
import { getTodaysBanger } from "../data/bangers";
import { useAppStore } from "../state/appStore";
import StreakModal, { buildWeekRow } from "../components/StreakModal";
import Countdown24h from "../components/Countdown24h";
import UnlockMoreModal from "../components/UnlockMoreModal";
import DailyProgressBar from "../components/DailyProgressBar";

export default function DailyBangerScreen() {
  const insets = useSafeAreaInsets();
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
    firstViewAtMs,
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

  const [unlockVisible, setUnlockVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    // Start countdown window immediately when visiting today
    useAppStore.getState().ensureTodayStart();
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
      Haptics.notificationAsync(mode === "lost" ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success);
      setStreakModalVisible(true);
    }
  }, []);





  return (
    <SafeAreaView 
      className="flex-1"
      style={{ flex: 1 }}
      edges={["left","right","bottom"]}
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        >




          {/* Subtle daily progress bar */}
          {firstViewAtMs ? (
            <DailyProgressBar startAtMs={firstViewAtMs} endAtMs={firstViewAtMs + 24 * 60 * 60 * 1000} />
          ) : null}

          {/* Centered Banger Card */}
          <View style={{ flex: 1, justifyContent: "center", paddingTop: 8 }}>
            <View style={{ marginBottom: 32 }}>
              <BangerCard banger={todaysBanger} showCategory={true} />
            </View>
          </View>

          {/* Footer with countdown and CTA */}
          <View 
            className="px-6 pb-8"
            style={{ paddingHorizontal: 24, paddingBottom: 32 }}
          >
            {firstViewAtMs ? (
              <Countdown24h endAtMs={firstViewAtMs + 24 * 60 * 60 * 1000} />
            ) : (
              <Text className="text-gray-600 text-center text-sm" style={{ color: "#6B7280", textAlign: "center", fontSize: 12 }}>
                Next daily countdown starting…
              </Text>
            )}
            <View style={{ height: 12 }} />
            <Pressable
              onPress={() => setUnlockVisible(true)}
              className="h-12 rounded-full overflow-hidden items-center justify-center"
              style={{ borderWidth: 1, borderColor: "#FFD3B0" }}
            >
              <LinearGradient colors={["#FF8C33", "#FF7A1A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", inset: 0, borderRadius: 999 }} />
              <Text className="font-semibold" style={{ color: "#FFFFFF" }}>Unlock more</Text>
            </Pressable>
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
        <UnlockMoreModal visible={unlockVisible} onClose={() => setUnlockVisible(false)} />
      </SafeAreaView>
   );
}