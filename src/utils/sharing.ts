import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import { Banger } from "../types/banger";

export const shareAsText = async (banger: Banger): Promise<boolean> => {
  const text = `"${banger.text}" — Greg Isenberg\n\nShared from Isenbangers 🚀`;
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    return false;
  }
};

export const shareAsImage = async (viewRef: any): Promise<boolean> => {
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
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const getShareableText = (banger: Banger): string => {
  return `"${banger.text}" — Greg Isenberg\n\nGet daily founder bangers at Isenbangers 🚀`;
};
