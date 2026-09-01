import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import { CustomAppleLoginButton } from "@/components/CustomAppleLoginButton";
import { CustomGoogleLoginButton } from "@/components/CustomGoogleLoginButton";
import Colors from "@/constants/Colors";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
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

// 💡 구글 네이티브 로그인 초기화 설정
GoogleSignin.configure({
  webClientId:
    "277459634612-9psmm9h2mp6r2ngse42qhv64urfg2h8j.apps.googleusercontent.com",
  iosClientId:
    "277459634612-2sq917cvk9iv5he2jpfceahno01aqug4.apps.googleusercontent.com",
  offlineAccess: true,
});

interface LoginData {
  email: string;
  password: string;
}

interface SocialLoginData {
  idToken: string;
  provider: "google" | "apple";
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. 이메일 로그인 Mutation
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
      // 백엔드에서 반환하는 전체 에러 응답 객체를 통째로 찍어봅니다.
      console.log("=== 백엔드 소셜 로그인 에러 상세 ===", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.message || "소셜 로그인 중 오류가 발생했습니다.";
      Alert.alert("오류", errorMessage);
    },
  });

  // 2. 소셜 로그인 Mutation (NestJS 백엔드로 idToken 전달)
  const socialLoginUser = async ({ idToken, provider }: SocialLoginData) => {
    const { data } = await client.post("/auth/social-login", {
      token: idToken,
      provider: provider,
    });
    return data;
  };

  const { mutate: socialLoginMutate, isPending: isSocialPending } = useMutation(
    {
      mutationFn: socialLoginUser,
      onSuccess: async (data) => {
        if (data.accessToken) {
          await setAccessToken(data.accessToken);
        }
        if (data.isNewUser) {
          // 신규 가입자라면 약관 동의 및 추가 정보 입력 페이지로 이동
          router.replace("/agreement");
        } else {
          // 기존 유저는 바로 메인으로
          router.replace("/(tabs)");
        }
      },
      onError: (error: any) => {
        // 백엔드에서 반환하는 전체 에러 응답 객체를 통째로 찍어봅니다.
        console.log("=== 백엔드 소셜 로그인 에러 상세 ===", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        const errorMessage =
          error.response?.data?.message ||
          "소셜 로그인 중 오류가 발생했습니다.";
        Alert.alert("오류", errorMessage);
      },
    },
  );

  // 3. 네이티브 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // 최신 라이브러리 버전 응답 구조 대응
      const idToken = response.data?.idToken || (response as any).idToken;

      if (idToken) {
        socialLoginMutate({ idToken, provider: "google" });
      } else {
        Alert.alert("오류", "구글 인증 토큰을 가져오지 못했습니다.");
      }
    } catch (error: any) {
      console.log("=== 구글 로그인 네이티브 에러 상세 ===", {
        code: error.code,
        message: error.message,
        fullError: JSON.stringify(error, null, 2),
      });
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // 사용자가 로그인을 취소함
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // 로그인 진행 중
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("오류", "Google Play Services를 사용할 수 없습니다.");
      } else {
        Alert.alert(
          "오류",
          error.message || "구글 로그인 중 문제가 발생했습니다.",
        );
      }
    }
  };

  // 4. 네이티브 애플 로그인 핸들러
  const handleAppleLogin = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("안내", "애플 로그인은 iOS기기에서만 지원됩니다.");
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        socialLoginMutate({
          idToken: credential.identityToken,
          provider: "apple",
        });
      } else {
        Alert.alert("오류", "애플 인증 토큰을 가져오지 못했습니다.");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // 사용자가 취소함
      } else {
        Alert.alert("오류", "애플 로그인 중 문제가 발생했습니다.");
      }
    }
  };

  // 이메일 로그인 제출 핸들러
  const handleEmailLogin = () => {
    if (!email.trim()) {
      Alert.alert("경고", "이메일을 입력해 주세요.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("경고", "비밀번호를 입력해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("안내", "올바른 이메일 형식이 아닙니다.");
      return;
    }
    loginMutate({ email, password });
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
            <Text style={[styles.logoText, { color: Colors.red }]}>⚡️ </Text>
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
              disabled={isPending || isSocialPending}
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
          {isSocialPending ? (
            <ActivityIndicator color={Colors.text} size="large" />
          ) : (
            <View style={styles.socialButtonRow}>
              {/* 구글 로그인 */}
              <CustomGoogleLoginButton onPress={handleGoogleLogin} />

              {/* 애플 로그인 */}
              <CustomAppleLoginButton onPress={handleAppleLogin} />
            </View>
          )}
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
    fontWeight: Platform.OS === "ios" ? "500" : "400",
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
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  signupLinkText: {
    fontSize: 14,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
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

  socialButtonRow: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
  },
});
