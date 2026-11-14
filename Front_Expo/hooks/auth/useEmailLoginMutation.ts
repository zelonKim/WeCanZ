import { queryClient } from "@/api/api-provider";
import { loginUser } from "@/api/auth/loginUser";
import { setAccessToken } from "@/api/token";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useEmailLoginMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
        await queryClient.invalidateQueries({ queryKey: ["me"] });
      }
      router.replace("/");
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
};
