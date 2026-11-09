import { signupUser } from "@/api/auth/signupUser";
import { setAccessToken } from "@/api/token";
import TermsModal from "@/components/TermsModal";
import Colors from "@/constants/Colors";
import { useSignupLanguage } from "@/hooks/useSignupLanguage";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";
import { generateRandomNickname } from "@/utils/generateRandomNickname";
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

export default function SignupScreen() {
  const { t, currentLang, nicknames } = useSignupLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState(() =>
    generateRandomNickname(nicknames, currentLang),
  );
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [modalType, setModalType] = useState<AgreementModalTypes | null>(null);

  const handleRefreshNickname = () => {
    const otherNickname = generateRandomNickname(nicknames, currentLang);
    setNickname(otherNickname);
  };

  const handleAllAgree = () => {
    const nextState = !(isTermsAgreed && isPrivacyAgreed && isMarketingAgreed);
    setIsTermsAgreed(nextState);
    setIsPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  //////////////////////////////////////////////////////////////////////////

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      setTimeout(() => {
        router.replace("/");
      }, 0);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || t.alerts.defaultSignupError;
      Alert.alert(t.alerts.error, errorMessage);
    },
  });

  //////////////////////////////////////////////////////////////////////////

  const handleSignup = async () => {
    if (email.trim().length < 5) {
      Alert.alert(t.alerts.notice, t.alerts.idMinLength);
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(t.alerts.notice, t.alerts.passwordRegex);
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert(t.alerts.notice, t.alerts.passwordMismatch);
      return;
    }

    if (nickname.trim().length < 2) {
      Alert.alert(t.alerts.notice, t.alerts.nicknameMinLength);
      return;
    }

    if (nickname.trim().length > 30) {
      Alert.alert(t.alerts.notice, t.alerts.nicknameMaxLength);
      return;
    }

    if (!isTermsAgreed) {
      Alert.alert(t.alerts.notice, t.alerts.termsRequiredAlert);
      return;
    }
    if (!isPrivacyAgreed) {
      Alert.alert(t.alerts.notice, t.alerts.privacyRequiredAlert);
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

  //////////////////////////////////////////////////////////////////////////

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
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.headerTitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.idLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.idPlaceholder}
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.passwordLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.passwordPlaceholder}
                placeholderTextColor="#666"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.passwordConfirmLabel}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.passwordConfirmPlaceholder}
                placeholderTextColor="#666"
                secureTextEntry
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.nicknameLabel}</Text>
              <View style={styles.nicknameInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t.nicknamePlaceholder}
                  placeholderTextColor="#666"
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={handleRefreshNickname}
                >
                  <Ionicons name="refresh" size={16} color={Colors.green} />
                  <Text style={[styles.refreshText, { color: Colors.green }]}>
                    {t.refreshNickname}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.termsSection}>
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
                      ? Colors.green
                      : "#8E8E93"
                  }
                />
                <Text style={styles.allAgreeText}>{t.allAgree}</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.checkRowContainer}>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setIsTermsAgreed(!isTermsAgreed)}
                >
                  <Ionicons
                    name={
                      isTermsAgreed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={20}
                    color={isTermsAgreed ? Colors.green : "#666"}
                  />
                  <Text style={styles.checkText}>{t.termsRequired}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalType("terms")}>
                  <Text style={styles.viewLinkText}>{t.viewLink}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.checkRowContainer}>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setIsPrivacyAgreed(!isPrivacyAgreed)}
                >
                  <Ionicons
                    name={
                      isPrivacyAgreed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={20}
                    color={isPrivacyAgreed ? Colors.green : "#666"}
                  />
                  <Text style={styles.checkText}>{t.privacyRequired}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalType("privacy")}>
                  <Text style={styles.viewLinkText}>{t.viewLink}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.checkRowContainer}>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setIsMarketingAgreed(!isMarketingAgreed)}
                >
                  <Ionicons
                    name={
                      isMarketingAgreed ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={20}
                    color={isMarketingAgreed ? Colors.green : "#666"}
                  />
                  <Text style={styles.checkText}>{t.marketingOptional}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalType("marketing")}>
                  <Text style={styles.viewLinkText}>{t.viewLink}</Text>
                </TouchableOpacity>
              </View>

              <TermsModal
                visible={modalType !== null}
                type={modalType}
                onClose={() => setModalType(null)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Colors.green }]}
            onPress={handleSignup}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Text style={styles.submitBtnText}>{t.submitBtn}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 12,
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
  submitBtnText: { color: Colors.background, fontSize: 16, fontWeight: "bold" },
  checkRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 3,
  },

  viewLinkText: {
    fontSize: 13,
    color: "#666",
    textDecorationLine: "underline",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "75%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 14,
    textAlign: "center",
  },
  modalScroll: {
    marginVertical: 6,
  },
  modalText: {
    fontSize: 13,
    color: "#B0B0B0",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.red,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
