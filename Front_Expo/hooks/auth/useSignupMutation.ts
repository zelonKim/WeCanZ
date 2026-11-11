import { signupUser } from "@/api/auth/signupUser";
import { setAccessToken } from "@/api/token";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useSignupMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
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
};
