import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AgreementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  useEffect(() => {
    if (me?.nickname) {
      setNickname(me.nickname);
    }
  }, [me]);

  // 전체 동의 상태 토글
  const handleAllAgree = () => {
    const nextState = !(termsAgreed && privacyAgreed);
    setTermsAgreed(nextState);
    setPrivacyAgreed(nextState);
  };

  // 회원가입 최종 완료 및 약관 동의 업데이트 API 호출
  const updateAgreementAndNickname = async () => {
    const { data } = await client.patch("/user/profile", {
      nickname,
      termsAgreedAt: new Date().toISOString(),
      privacyAgreedAt: new Date().toISOString(),
    });
    return data;
  };

  const { mutate: completeMutate, isPending } = useMutation({
    mutationFn: updateAgreementAndNickname,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      Alert.alert("알림", displayMessage || "처리 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = () => {
    if (!nickname.trim()) {
      Alert.alert("경고", "사용하실 닉네임을 입력해 주세요.");
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      Alert.alert("경고", "필수 약관에 모두 동의해 주세요.");
      return;
    }
    completeMutate();
  };

  const isFormValid =
    nickname.trim().length > 0 && termsAgreed && privacyAgreed;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>거의 다 완료되었습니다! 🚀</Text>
        <Text style={styles.subtitle}>
          서비스 이용을 위해 닉네임과 약관 동의가 필요해요.
        </Text>

        {/* 닉네임 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            placeholder="사용하실 닉네임을 입력하세요"
            placeholderTextColor="#666"
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
          />
        </View>

        {/* 약관 동의 영역 */}
        <View style={styles.agreementSection}>
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={handleAllAgree}
          >
            <Text
              style={[
                styles.checkbox,
                termsAgreed && privacyAgreed && styles.checkedBox,
              ]}
            >
              {termsAgreed && privacyAgreed ? "✓" : ""}
            </Text>
            <Text style={styles.allAgreeText}>전체 약관 동의하기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setTermsAgreed(!termsAgreed)}
          >
            <Text style={[styles.checkbox, termsAgreed && styles.checkedBox]}>
              {termsAgreed ? "✓" : ""}
            </Text>
            <Text style={styles.agreementText}>
              [필수] 서비스 이용약관 동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setPrivacyAgreed(!privacyAgreed)}
          >
            <Text style={[styles.checkbox, privacyAgreed && styles.checkedBox]}>
              {privacyAgreed ? "✓" : ""}
            </Text>
            <Text style={styles.agreementText}>
              [필수] 개인정보 처리방침 동의
            </Text>
          </TouchableOpacity>
        </View>

        {/* 시작하기 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: isFormValid ? Colors.yellow : "#333" },
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={[
                styles.submitBtnText,
                { color: isFormValid ? "#000" : "#666" },
              ]}
            >
              시작하기
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  content: { gap: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  subtitle: { fontSize: 14, color: "#8E8E93", marginTop: -16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  input: {
    backgroundColor: "#1C1C1E",
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    color: "#FFF",
    fontSize: 15,
  },
  agreementSection: {
    backgroundColor: "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  agreementRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#666",
    borderRadius: 6,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#000",
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  checkedBox: {
    backgroundColor: "#E6F4FE",
    borderColor: "#E6F4FE",
  },
  allAgreeText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  agreementText: { color: "#CCC", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginVertical: 4 },
  submitBtn: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitBtnText: { fontSize: 16, fontWeight: "bold" },
});
