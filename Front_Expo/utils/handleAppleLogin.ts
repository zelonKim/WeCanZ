import { socialLoginParams } from "@/types/auth/AppleLoginParams";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert, Platform } from "react-native";

export const handleAppleLogin = async ({
  t,
  socialLoginMutate,
}: socialLoginParams) => {
  if (Platform.OS !== "ios") {
    Alert.alert(t.alerts.error, t.alerts.appleUnsupportedMsg);
    return;
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const idToken = credential.identityToken;

    if (idToken) {
      socialLoginMutate({ idToken, provider: "apple" });
    } else {
      Alert.alert(t.alerts.error, t.alerts.appleTokenErrorMsg);
    }
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      return;
    }
    Alert.alert(t.alerts.error, t.alerts.appleLoginErrorMsg);
  }
};
