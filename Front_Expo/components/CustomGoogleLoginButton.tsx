import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GoogleLoginButtonProps {
  onPress: () => void;
}

export function CustomGoogleLoginButton({ onPress }: GoogleLoginButtonProps) {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        {/* 공식 4색 Google G 로고 사용 */}
        <Image
          source={require("@/assets/images/google_logo.png")}
          style={styles.logo}
        />
        <Text style={styles.googleButtonText}>Google로 로그인</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    width: "100%",

    borderWidth: 1,
    borderColor: "#747775",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: "contain",
  },
  googleButtonText: {
    color: "#1F1F1F", // Google 공식 텍스트 컬러
    fontSize: 16,
    fontWeight: "600",
  },
});
