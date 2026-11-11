import { getMyInfo } from "@/api/user/getMyInfo";
import { updateAgreementAndNickname } from "@/api/user/updateAgreementAndNickname";
import TermsModal from "@/components/TermsModal";
import Colors from "@/constants/Colors";
import { useAgreementLanguage } from "@/hooks/Languages/useAgreementLanguage";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";
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
  const { t } = useAgreementLanguage();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [modalType, setModalType] = useState<AgreementModalTypes | null>(null);

  const isFormValid =
    nickname.trim().length > 0 && termsAgreed && privacyAgreed;

  const handleAllAgree = () => {
    const nextState = !(termsAgreed && privacyAgreed && isMarketingAgreed);
    setTermsAgreed(nextState);
    setPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  useEffect(() => {
    if (me?.nickname) {
      setNickname(me.nickname);
    }
  }, [me]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: completeAgreeMutate, isPending } = useMutation({
    mutationFn: () => updateAgreementAndNickname(nickname, isMarketingAgreed),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      Alert.alert(t.alerts.warning, t.alerts.defaultError);
    },
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmit = () => {
    if (!nickname.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.nicknameRequired);
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      Alert.alert(t.alerts.warning, t.alerts.termsRequired);
      return;
    }
    completeAgreeMutate();
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.background }]}
    >
      <View style={styles.content}>
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Text style={styles.title}>{t.title}</Text>
          <Image
            source={require("@/assets/images/sticker.png")}
            style={{ width: 50, height: 50 }}
          />
        </View>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.nicknameLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.nicknamePlaceholder}
            placeholderTextColor="#666"
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
            autoCapitalize="none"
          />
        </View>

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
            <Text style={styles.allAgreeText}>{t.allAgree}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

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
              <Text style={styles.agreementText}>{t.termsAgree}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType("terms")}>
              <Text style={styles.viewLinkText}>{t.viewLink}</Text>
            </TouchableOpacity>
          </View>

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
              <Text style={styles.agreementText} numberOfLines={2}>
                {t.privacyAgree}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalType("privacy")}>
              <Text style={styles.viewLinkText}>{t.viewLink}</Text>
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
              <Text style={styles.agreementText}>{t.marketingAgree}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalType("marketing")}>
              <Text style={styles.viewLinkText}>{t.viewLink}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              {t.startBtn}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <TermsModal
        visible={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////

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
  agreementText: { color: "#CCC", fontSize: 14, maxWidth: 230 },
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
