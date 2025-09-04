import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import { Alert } from "react-native";
import { Banger } from "../types/banger";

export const shareAsText = async (banger: Banger) => {
  const text = `"${banger.text}" — Greg Isenberg\n\nShared from Isenbangers 🚀`;
  
  try {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Banger copied to clipboard");
  } catch (error) {
    Alert.alert("Error", "Could not copy to clipboard");
  }
};

export const shareAsImage = async (viewRef: any) => {
  try {
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share this banger!",
      });
    } else {
      Alert.alert("Sharing not available", "Image sharing is not available on this device");
    }
  } catch (error) {
    Alert.alert("Error", "Could not share image");
  }
};

export const getShareableText = (banger: Banger): string => {
  return `"${banger.text}" — Greg Isenberg\n\nGet daily founder bangers at Isenbangers 🚀`;
};