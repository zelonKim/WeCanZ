import { useSettingLanguage } from "@/hooks/Languages/useSettingLanguage";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const handleImagePick = async (
  setSelectedImage: (uri: string) => void,
) => {
  const t = useSettingLanguage();

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(t.alertNotice, t.alertImageGranted);
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0].uri) {
    setSelectedImage(result.assets[0].uri);
  }
};
