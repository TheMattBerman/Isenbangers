import React from "react";
import { View, Text } from "react-native";
import { getTodaysBanger } from "../data/bangers";

export default function TestComponent() {
  const testBanger = getTodaysBanger();
  
  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 10, borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Test Component - Data Check
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 5 }}>
        Banger ID: {testBanger?.id || 'No ID'}
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 5 }}>
        Category: {testBanger?.category || 'No category'}
      </Text>
      <Text style={{ fontSize: 12 }}>
        Text: {testBanger?.text?.substring(0, 100) || 'No text'}...
      </Text>
    </View>
  );
}