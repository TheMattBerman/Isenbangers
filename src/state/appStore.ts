import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  // Streak tracking
  currentStreak: number;
  lastViewedDate: string | null;
  totalBangersViewed: number;
  
  // Favorites
  favoriteBangers: string[];
  
  // Daily banger tracking
  dailyBangerViewed: boolean;
  lastDailyBangerDate: string | null;
  
  // UI / Streak modal guard
  lastStreakShownDate: string | null;
  setLastStreakShownToday: () => void;
  
  // Actions
  incrementStreak: () => void;
  resetStreak: () => void;
  addToFavorites: (bangerId: string) => void;
  removeFromFavorites: (bangerId: string) => void;
  markDailyBangerViewed: () => void;
  incrementTotalViewed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      lastViewedDate: null,
      totalBangersViewed: 0,
      favoriteBangers: [],
      dailyBangerViewed: false,
      lastDailyBangerDate: null,
      lastStreakShownDate: null,
      
      incrementStreak: () => {
        const today = new Date().toDateString();
        const { lastViewedDate } = get();
        
        if (lastViewedDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        set((state) => ({
          currentStreak: lastViewedDate === yesterday.toDateString() 
            ? state.currentStreak + 1 
            : 1,
          lastViewedDate: today,
        }));
      },
      
      resetStreak: () => set({ currentStreak: 0, lastViewedDate: null }),
      
      addToFavorites: (bangerId: string) => 
        set((state) => ({
          favoriteBangers: [...state.favoriteBangers, bangerId]
        })),
      
      removeFromFavorites: (bangerId: string) =>
        set((state) => ({
          favoriteBangers: state.favoriteBangers.filter(id => id !== bangerId)
        })),
      
      markDailyBangerViewed: () => {
        const today = new Date().toDateString();
        set({
          dailyBangerViewed: true,
          lastDailyBangerDate: today,
        });
      },
      
      incrementTotalViewed: () =>
        set((state) => ({
          totalBangersViewed: state.totalBangersViewed + 1
        })),
      setLastStreakShownToday: () => {
        const today = new Date().toDateString();
        set({ lastStreakShownDate: today });
      },
    }),
    {
      name: "isenbangers-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);