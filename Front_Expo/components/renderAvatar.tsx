import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

export const renderAvatar = (profileImage?: string) => {
  if (profileImage) {
    return <Image source={{ uri: profileImage }} style={styles.avatar} />;
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Ionicons name="person" size={22} color={Colors.text || "#333"} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border || "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
});
