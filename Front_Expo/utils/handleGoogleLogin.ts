import { socialLoginParams } from "@/types/auth/AppleLoginParams";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

export const handleGoogleLogin = async ({
  t,
  socialLoginMutate,
}: socialLoginParams) => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const idToken =
      response.data?.idToken ?? (response as { idToken?: string }).idToken;

    if (idToken) {
      socialLoginMutate({ idToken, provider: "google" });
    } else {
      Alert.alert(t.alerts.error, t.alerts.googleTokenErrorMsg);
    }
  } catch (error: any) {
    console.log("=== Google Login Error ===", {
      code: error.code,
      message: error.message,
    });

    if (
      error.code === statusCodes.SIGN_IN_CANCELLED ||
      error.code === statusCodes.IN_PROGRESS
    ) {
      return;
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
