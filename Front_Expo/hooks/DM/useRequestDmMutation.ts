import { requestDM } from "@/api/DM/requestDM";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useRequestDmLanguage } from "../Languages/useRequestDmLanguage";

export const useRequestDmMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { t } = useRequestDmLanguage();

  return useMutation({
    mutationFn: requestDM,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.requestSent);
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      Alert.alert(t.alerts.error, t.alerts.requestFail);
    },
  });
};
