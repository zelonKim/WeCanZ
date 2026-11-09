import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const handleImagePick = async (
  setProfileImage: (uri: string) => void,
  t: any,
) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      t.alertNotice,
     t.alertImageGranted,
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0].uri) {
    setProfileImage(result.assets[0].uri);
  }
};
