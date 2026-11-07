import { client } from "@/api/client";
import TermsModal from "@/components/TermsModal";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  const [modalType, setModalType] = useState<
    "terms" | "privacy" | "marketing" | null
  >(null);

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
    const nextState = !(termsAgreed && privacyAgreed && isMarketingAgreed);
    setTermsAgreed(nextState);
    setPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  // 회원가입 최종 완료 및 약관 동의 업데이트 API 호출
  const updateAgreementAndNickname = async () => {
    const { data } = await client.patch("/user/profile", {
      nickname,
      termsAgreedAt: new Date().toISOString(),
      privacyAgreedAt: new Date().toISOString(),
      marketingAgreedAt: isMarketingAgreed ? new Date().toISOString() : null,
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
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Text style={styles.title}>거의 다 완료됐어요</Text>
          <Image
            source={require("@/assets/images/sticker.png")}
            style={{ width: 50, height: 50 }}
          />
        </View>
        <Text style={styles.subtitle}>
          서비스 이용을 위해서는 닉네임과 유저 동의가 필요해요.
        </Text>

        {/* 닉네임 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            placeholder="최소 2자 이상 입력"
            placeholderTextColor="#666"
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
            autoCapitalize="none"
          />
        </View>

        {/* 약관 동의 영역 */}
        <View style={styles.agreementSection}>
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={handleAllAgree}
          >
            <Ionicons
              name={
                termsAgreed && privacyAgreed && isMarketingAgreed
                  ? "checkbox"
                  : "square-outline"
              }
              size={20}
              color={
                termsAgreed && privacyAgreed && isMarketingAgreed
                  ? Colors.green
                  : "#666"
              }
            />
            <Text style={styles.allAgreeText}>전체 동의하기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 서비스 이용약관 */}
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setTermsAgreed(!termsAgreed)}
            >
              <Ionicons
                name={termsAgreed ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={termsAgreed ? Colors.green : "#666"}
              />
              <Text style={styles.agreementText}>
                [필수] 서비스 이용약관 동의
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType("terms")}>
              <Text style={styles.viewLinkText}>보기</Text>
            </TouchableOpacity>
          </View>

          {/* 개인정보 처리방침 */}
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setPrivacyAgreed(!privacyAgreed)}
            >
              <Ionicons
                name={privacyAgreed ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={privacyAgreed ? Colors.green : "#666"}
              />
              <Text style={styles.agreementText}>
                [필수] 개인정보 처리방침 동의
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType("privacy")}>
              <Text style={styles.viewLinkText}>보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setIsMarketingAgreed(!isMarketingAgreed)}
            >
              <Ionicons
                name={
                  isMarketingAgreed ? "checkmark-circle" : "ellipse-outline"
                }
                size={20}
                color={isMarketingAgreed ? Colors.green : "#666"}
              />
              <Text style={styles.agreementText}>
                [선택] 마케팅 정보 수신 동의
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalType("marketing")}>
              <Text style={styles.viewLinkText}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 시작하기 버튼 */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: isFormValid ? Colors.green : "#333" },
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

      {/* 💡 약관 및 개인정보 처리방침 모달 컴포넌트 장착 */}
      <TermsModal
        visible={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  content: { gap: 24 },
  title: {
    fontSize: 24,
    flexDirection: "row",

    fontWeight: "bold",
    color: Colors.green,
  },
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  agreementRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  allAgreeText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  agreementText: { color: "#CCC", fontSize: 14 },
  viewLinkText: {
    color: "#8E8E93",
    fontSize: 13,
    textDecorationLine: "underline",
  },
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
