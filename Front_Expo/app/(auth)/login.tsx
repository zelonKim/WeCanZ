import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import Colors from "@/constants/Colors";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (loginData: LoginData) => {
    const { data } = await client.post("/auth/login", loginData);
    return data;
  };

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // 이메일 로그인 처리
  const handleEmailLogin = () => {
    if (!email.trim()) {
      alert("이메일을 입력해 주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("안내", "올바른 이메일 형식이 아닙니다.");
      return;
    }
    loginMutate({ email, password });
  };

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도`);
    router.push("/(auth)/signup");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. 상단 로고 & 타이틀 */}
          <View style={styles.brandSection}>
            <Text style={[styles.logoText, { color: Colors.red }]}>⚡️ 종태원</Text>
            <Text style={styles.subText}>
              오늘 밤, 가장 핫한 술번개 & 클럽번개
            </Text>
          </View>

          {/* 2. 이메일 & 비밀번호 입력 폼 */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="이메일 주소"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: Colors.yellow }]}
              onPress={handleEmailLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.loginBtnText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 회원가입 이동 박스/링크 */}
            <View style={styles.signupBox}>
              <Text style={styles.signupPrompt}>아직 계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={[styles.signupLinkText, { color: Colors.red }]}>
                  회원가입
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. 구분을 위한 구분선 */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>간편 로그인</Text>
            <View style={styles.divider} />
          </View>

          {/* 4. 하단 간편 소셜 로그인 */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  brandSection: { alignItems: "center", marginBottom: 32 },
  logoText: {
    fontSize: 36,
    fontWeight: Platform.OS === "ios" ? "800" : "600",
    marginBottom: 6,
  },
  subText: {
    fontSize: Platform.OS === "ios" ? 14 : 13,
    color: "#A1A1A6",
    fontWeight: Platform.OS === "ios" ? 500 : 400,
  },

  formSection: { gap: 12 },
  inputGroup: { width: "100%" },
  input: {
    backgroundColor: "#1C1C1E",
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 15,
  },
  loginBtn: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },

  signupBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  signupPrompt: {
    color: "#8E8E93",
    fontSize: Platform.OS === "ios" ? 14 : 13,
    fontWeight: Platform.OS === "ios" ? 500 : 400,
  },
  signupLinkText: {
    fontSize: 14,
    fontWeight: Platform.OS === "ios" ? 600 : 500,
    textDecorationLine: "underline",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#2C2C2E" },
  dividerText: {
    color: "#666",
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: "500",
  },

  socialSection: { gap: 10 },
  socialBtn: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  kakaoText: { fontSize: 15, color: "#191919", fontWeight: "bold" },
  appleText: { fontSize: 15, color: "#000000", fontWeight: "bold" },
});
