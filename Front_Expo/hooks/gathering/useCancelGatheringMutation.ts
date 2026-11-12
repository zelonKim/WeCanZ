import { cancelGathering } from "@/api/gathering/cancelGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCancelGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: cancelGathering,
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.gatheringCancelSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.gatheringCancelFail;
      Alert.alert(t.alerts.error, Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
