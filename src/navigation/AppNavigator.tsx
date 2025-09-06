import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DailyBangerScreen from "../screens/DailyBangerScreen";
import SpinWheelScreen from "../screens/SpinWheelScreen";
import LibraryScreen from "../screens/LibraryScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Today") {
            iconName = focused ? "today" : "today-outline";
          } else if (route.name === "Spin") {
            iconName = focused ? "refresh-circle" : "refresh-circle-outline";
          } else if (route.name === "Library") {
            iconName = focused ? "library" : "library-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: route.name === "Spin" ? "#0b0f19" : "#FFFFFF",
        },
        headerTintColor: route.name === "Spin" ? "#FFFFFF" : "#111111",
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: "600",
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen 
        name="Today" 
        component={DailyBangerScreen}
        options={{ title: "The Daily", headerShown: false }}
      />
      <Tab.Screen 
        name="Spin" 
        component={SpinWheelScreen}
        options={{ title: "The Wheel" }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ title: "The Library" }}
      />
    </Tab.Navigator>
  );
}