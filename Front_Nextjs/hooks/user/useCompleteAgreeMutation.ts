import { updateAgreementAndNickname } from "@/api/user/updateAgreementAndNickname";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCompleteAgreeMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateAgreementAndNickname,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      alert(t.alerts.defaultError);
    },
  });
};
