import { queryClient } from "@/api/api-provider";
import { socialLoginUser } from "@/api/auth/socialLoginUser";
import { setAccessToken } from "@/api/token";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useSocialLoginMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
    mutationFn: socialLoginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
        await queryClient.invalidateQueries({ queryKey: ["me"] });
      }
      if (data.isNewUser) {
        router.replace("/agreement");
      } else {
        router.replace("/");
      }
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
  });
};
