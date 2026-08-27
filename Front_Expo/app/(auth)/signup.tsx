import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
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

// 랜덤 닉네임 생성 단어 목록
const ADJECTIVES = [
  "끼떠는",
  "일틱한",
  "훈훈한",
  "기갈부리는",
  "귀여운",
  "건장한",
];
const NOUNS = ["바텀", "탑", "올바텀", "올탑", "올", "비선호"];

// 랜덤 닉네임 생성 함수
const generateRandomNickname = (): string => {
  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${randomAdj}${randomNoun}_${randomNumber}`;
};

//////////////////////////////////////

interface SignupData {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  isMarketingAgreed: boolean;
}

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 닉네임 초기값
  const [nickname, setNickname] = useState(() => generateRandomNickname());

  // 약관 동의 상태
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  // 닉네임 새로고침
  // const handleRefreshNickname = () => {
  //   setNickname(generateRandomNickname());
  // };

  // 전체 동의 토글
  const handleAllAgree = () => {
    const nextState = !(isTermsAgreed && isPrivacyAgreed && isMarketingAgreed);
    setIsTermsAgreed(nextState);
    setIsPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  const signupUser = async (signupData: SignupData) => {
    const { data } = await client.post("/auth/signup", signupData);
    return data;
  };

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      alert("회원가입이 완료되었습니다! ⚡️");

      // 2. 토큰 저장 후 마이페이지(메인)로 이동
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // 회원가입
  const handleSignup = async () => {
    // 1. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("알림", "올바른 이메일 형식이 아닙니다.");
      return;
    }

    // 2. 비밀번호 검증 (영문, 숫자 포함 8자 이상)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "알림",
        "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.",
      );
      return;
    }

    // 3. 비밀번호 확인 검증
    if (password !== passwordConfirm) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
      return;
    }

    // 4. 닉네임 길이 검증
    if (nickname.trim().length < 2) {
      Alert.alert("알림", "닉네임은 최소 2글자 이상이어야 합니다.");
      return;
    }

    // 5. 필수 약관 동의 검증
    if (!isTermsAgreed) {
      Alert.alert("알림", "서비스 이용 약관에 동의해야 합니다.");
      return;
    }
    if (!isPrivacyAgreed) {
      Alert.alert("알림", "개인정보 처리 방침에 동의해야 합니다.");
      return;
    }

    signupMutate({
      email,
      password,
      passwordConfirm,
      nickname,
      isTermsAgreed,
      isPrivacyAgreed,
      isMarketingAgreed,
    });
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
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>회원가입</Text>
          </View>

          {/* 입력 폼 영역 */}
          <View style={styles.form}>
            {/* 이메일 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            {/* 비밀번호 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="영문, 숫자 포함 8자 이상"
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor="#666"
                secureTextEntry
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                autoCapitalize="none"
              />
            </View>

            {/* 닉네임 (랜덤 기본값 + 생성 버튼) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>닉네임</Text>
              <View style={styles.nicknameInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="최소 2자 이상 입력"
                  placeholderTextColor="#666"
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="none"
                />
                {/* <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={handleRefreshNickname}
                >
                  <Ionicons name="refresh" size={16} color={Colors.red} />
                  <Text style={[styles.refreshText, { color: Colors.red }]}>
                    랜덤 생성
                  </Text>
                </TouchableOpacity> */}
              </View>
            </View>

            {/* 약관 동의 섹션 */}
            <View style={styles.termsSection}>
              {/* 전체 동의 */}
              <TouchableOpacity
                style={styles.allAgreeBtn}
                onPress={handleAllAgree}
              >
                <Ionicons
                  name={
                    isTermsAgreed && isPrivacyAgreed && isMarketingAgreed
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={
                    isTermsAgreed && isPrivacyAgreed && isMarketingAgreed
                      ? Colors.red
                      : "#8E8E93"
                  }
                />
                <Text style={styles.allAgreeText}>전체 동의하기</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* 서비스 이용약관 (필수) */}
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setIsTermsAgreed(!isTermsAgreed)}
              >
                <Ionicons
                  name={isTermsAgreed ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={isTermsAgreed ? Colors.red : "#666"}
                />
                <Text style={styles.checkText}>
                  [필수] 서비스 이용 약관 동의
                </Text>
              </TouchableOpacity>

              {/* 개인정보 처리방침 (필수) */}
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setIsPrivacyAgreed(!isPrivacyAgreed)}
              >
                <Ionicons
                  name={
                    isPrivacyAgreed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={20}
                  color={isPrivacyAgreed ? Colors.red : "#666"}
                />
                <Text style={styles.checkText}>
                  [필수] 개인정보 처리 방침 동의
                </Text>
              </TouchableOpacity>

              {/* 마케팅 정보 수신 (선택) */}
              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setIsMarketingAgreed(!isMarketingAgreed)}
              >
                <Ionicons
                  name={
                    isMarketingAgreed ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={20}
                  color={isMarketingAgreed ? Colors.red : "#666"}
                />
                <Text style={styles.checkText}>
                  [선택] 마케팅 정보 수신 동의
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 가입하기 버튼 */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Colors.red }]}
            onPress={handleSignup}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.submitBtnText}>가입하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 10,
  },
  backBtn: { paddingRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF" },

  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, color: "#A1A1A6", fontWeight: "600" },
  input: {
    backgroundColor: "#1C1C1E",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 15,
  },
  nicknameInputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  refreshBtn: {
    height: 50,
    paddingHorizontal: 12,
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "bold",
  },

  termsSection: {
    backgroundColor: "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 12,
  },
  allAgreeBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  allAgreeText: { fontSize: 16, fontWeight: "bold", color: "#FFF" },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginVertical: 4 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkText: { fontSize: 14, color: "#CCC" },

  submitBtn: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});
