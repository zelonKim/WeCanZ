import { CustomAppleLoginButton } from "@/components/CustomAppleLoginButton";
import { CustomGoogleLoginButton } from "@/components/CustomGoogleLoginButton";
import Colors from "@/constants/Colors";
import { useEmailLoginMutation } from "@/hooks/auth/useEmailLoginMutation";
import { useSocialLoginMutation } from "@/hooks/auth/useSocialLoginMutation";
import { useLoginLanguage } from "@/hooks/Languages/useLoginLanguage";
import { LoginDto } from "@/types/auth/LoginDto";
import { configureGoogleSignIn } from "@/utils/googleSigninConfig";
import { handleAppleLogin } from "@/utils/handleAppleLogin";
import { handleGoogleLogin } from "@/utils/handleGoogleLogin";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen() {
  const { t } = useLoginLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  ///////////////////////////////////////////////////////////////////////////

  const { mutate: loginMutate, isPending: loginPending } =
    useEmailLoginMutation(t);

  const handleEmailLogin = () => {
    if (!email.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.idRequired);
      return;
    }

    if (!password.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.pwRequired);
      return;
    }

    const loginPayload: LoginDto = { email, password };

    loginMutate(loginPayload);
  };

  ///////////////////////////////////////////////////////////////////////////

  const { mutate: socialLoginMutate, isPending: isSocialPending } =
    useSocialLoginMutation(t);

  ///////////////////////////////////////////////////////////////////////////

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
          <View style={styles.brandSection}>
            <Image
              source={require("@/assets/images/sticker.png")}
              style={styles.sticker}
            />
            <Text style={[styles.logoText, { color: Colors.green }]}>
              WeCanZ
            </Text>

            <Text style={styles.subText}>{t.subText}</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={t.idPlaceholder}
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={t.passwordPlaceholder}
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: Colors.green }]}
              onPress={handleEmailLogin}
              disabled={loginPending || isSocialPending}
            >
              {loginPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.loginBtnText}>{t.loginBtn}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupBox}>
              <Text style={styles.signupPrompt}>{t.signupPrompt}</Text>

              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={[styles.signupLinkText, { color: Colors.green }]}>
                  {t.signupLink}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t.dividerText}</Text>

            <View style={styles.divider} />
          </View>

          {isSocialPending ? (
            <ActivityIndicator color={Colors.text} size="large" />
          ) : (
            <View style={styles.socialButtonRow}>
              <CustomGoogleLoginButton
                onPress={() => handleGoogleLogin({ t, socialLoginMutate })}
                text={t.googleLoginBtn}
              />

              {Platform.OS === "ios" && (
                <CustomAppleLoginButton
                  onPress={() => handleAppleLogin({ t, socialLoginMutate })}
                  text={t.appleLoginBtn}
                />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////

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
    fontStyle: "italic",
    fontSize: 36,
    fontWeight: Platform.OS === "ios" ? "800" : "600",
    marginBottom: 6,
  },
  subText: {
    fontSize: Platform.OS === "ios" ? 14 : 13,
    color: "#A1A1A6",
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  sticker: {
    width: 90,
    height: 90,
    marginBottom: 5,
  },
  formSection: { gap: 12 },
  inputGroup: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    height: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
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
    fontSize: Platform.OS === "ios" ? 14 : 13,
    fontWeight: Platform.OS === "ios" ? "600" : "400",
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
