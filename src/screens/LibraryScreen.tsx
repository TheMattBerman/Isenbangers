import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import BangerCard from "../components/BangerCard";
import { mockBangers } from "../data/bangers";
import { useAppStore } from "../state/appStore";
import { Banger } from "../types/banger";

const categories = ["all", "fundraising", "grit", "growth", "mindset", "startup", "general"];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favoriteBangers } = useAppStore();

  const filteredBangers = useMemo(() => {
    let filtered = mockBangers;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(banger =>
        banger.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(banger => banger.category === selectedCategory);
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(banger => favoriteBangers.includes(banger.id));
    }

    return filtered;
  }, [searchQuery, selectedCategory, showFavoritesOnly, favoriteBangers]);



  const renderBanger = ({ item }: { item: Banger }) => (
    <View className="mb-4">
      <BangerCard 
        banger={item} 
        showCategory={selectedCategory === "all"}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Banger Library
        </Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search bangers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <View className="flex-row items-center justify-between mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-1"
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCategory === category
                    ? "bg-orange-500"
                    : "bg-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold capitalize ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <Pressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`ml-2 p-2 rounded-full ${
              showFavoritesOnly ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <Ionicons
              name={showFavoritesOnly ? "heart" : "heart-outline"}
              size={20}
              color={showFavoritesOnly ? "white" : "#6b7280"}
            />
          </Pressable>
        </View>

        {/* Results Count */}
        <Text className="text-gray-600 text-sm">
          {filteredBangers.length} banger{filteredBangers.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      {/* Bangers List */}
      <View className="flex-1 pt-4">
        {filteredBangers.length > 0 ? (
          <FlashList
            data={filteredBangers}
            renderItem={renderBanger}
            estimatedItemSize={200}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="search" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
              No bangers found
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}