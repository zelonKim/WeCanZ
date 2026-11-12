import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { completeGathering } from "@/api/gathering/completeGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";

export const useCompleteGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: completeGathering,
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.completeSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.completeFail;
      Alert.alert(t.alerts.error, Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
