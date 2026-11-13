import { socialLoginUser } from "@/api/auth/socialLoginUser";
import { setAccessToken } from "@/api/token";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useSocialLoginMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
    mutationFn: socialLoginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      setTimeout(() => {
        if (data.isNewUser) {
          router.replace("/agreement");
          window.dispatchEvent(new Event("auth-state-change"));
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
      alert(errorMessage);
    },
  });
};
