import { requestDM } from "@/api/DM/requestDM";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useRequestDmMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

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
