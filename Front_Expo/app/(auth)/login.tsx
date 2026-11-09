import { loginUser } from "@/api/auth/loginUser";
import { socialLoginUser } from "@/api/auth/socialLoginUser";
import { setAccessToken } from "@/api/token";
import { CustomAppleLoginButton } from "@/components/CustomAppleLoginButton";
import { CustomGoogleLoginButton } from "@/components/CustomGoogleLoginButton";
import Colors from "@/constants/Colors";
import { useLoginLanguage } from "@/hooks/useLoginLanguage";
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
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

GoogleSignin.configure({
  webClientId:
    "716946851146-fdhf9939k1giu735237ugffrrddv4viu.apps.googleusercontent.com",
  iosClientId:
    "716946851146-s7mmdsl09dobipj8ffu1pd5qtbvklg05.apps.googleusercontent.com",
  offlineAccess: true,
});

export default function LoginScreen() {
  const { t } = useLoginLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: loginMutate, isPending: loginPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      setTimeout(() => {
        router.replace("/");
      }, 0);
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      let errorMessage = t.alerts.defaultErrorMsg;

      if (errorData) {
        if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t.alerts.error, errorMessage);
    },
  });

  ///////////////////////////////////////////////////////////////////////////

  const handleEmailLogin = () => {
    if (!email.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.idRequired);
      return;
    }

    if (!password.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.pwRequired);
      return;
    }

    loginMutate({ email, password });
  };

  ///////////////////////////////////////////////////////////////////////////

  const { mutate: socialLoginMutate, isPending: isSocialPending } = useMutation(
    {
      mutationFn: socialLoginUser,
      onSuccess: async (data) => {
        if (data.accessToken) {
          await setAccessToken(data.accessToken);
        }
        setTimeout(() => {
          if (data.isNewUser) {
            router.replace("/agreement");
          } else {
            router.replace("/");
          }
        }, 0);
      },
      onError: (error: any) => {
        console.log("=== Backend Social Login Error ===", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        const errorMessage = t.alerts.socialLoginErrorMsg;
        Alert.alert(t.alerts.error, errorMessage);
      },
    },
  );

  ///////////////////////////////////////////////////////////////////////////

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken || (response as any).idToken;

      if (idToken) {
        socialLoginMutate({ idToken, provider: "google" });
      } else {
        Alert.alert(t.alerts.error, t.alerts.googleTokenErrorMsg);
      }
    } catch (error: any) {
      console.log("=== Google Login Error ===", {
        code: error.code,
        message: error.message,
        fullError: JSON.stringify(error, null, 2),
      });
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(t.alerts.error, t.alerts.playServicesErrorMsg);
      } else {
        Alert.alert(
          t.alerts.error,
          error.message || t.alerts.googleLoginErrorMsg,
        );
      }
    }
  };

  ///////////////////////////////////////////////////////////////////////////

  const handleAppleLogin = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(t.alerts.appleUnsupported, t.alerts.appleUnsupportedMsg);
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
        Alert.alert(t.alerts.appleTokenError, t.alerts.appleTokenErrorMsg);
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
      } else {
        Alert.alert(t.alerts.error, t.alerts.appleLoginErrorMsg);
      }
    }
  };

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
                onPress={handleGoogleLogin}
                text={t.googleLoginBtn}
              />

              {Platform.OS === "ios" && (
                <CustomAppleLoginButton
                  onPress={handleAppleLogin}
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
