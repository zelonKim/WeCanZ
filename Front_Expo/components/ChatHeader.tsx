import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChatHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  avatarUri?: string | null;
  onAvatarPress?: () => void;
  onReportPress: () => void;
  children?: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBack,
  title,
  subtitle,
  avatarUri,
  onAvatarPress,
  onReportPress,
  children,
}) => {
  return (
    <View style={[styles.header, { position: "relative" }]}>

      <TouchableOpacity
        style={{
          width: 40,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
      </TouchableOpacity>


      <View
        style={{
          position: "absolute",
          left: 50,
          right: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",

          gap: 8,
          pointerEvents: "box-none",
        }}
      >
        <View style={{ position: "relative" }}>
          {onAvatarPress ? (
            <TouchableOpacity activeOpacity={0.5} onPress={onAvatarPress}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Ionicons name="person" size={20} color={Colors.text} />
                </View>
              )}
            </TouchableOpacity>
          ) : null}
          {children}
        </View>


        <View style={{ flexShrink: 1 }}>
          <Text style={styles.headerNickname} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>


      <TouchableOpacity
        style={{ width: 40, alignItems: "flex-end", justifyContent: "center" }}
        onPress={onReportPress}
      >
        <Ionicons name="warning-outline" size={20} color="#FF453A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerNickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 2,
    textAlign: "center",
  },
});
