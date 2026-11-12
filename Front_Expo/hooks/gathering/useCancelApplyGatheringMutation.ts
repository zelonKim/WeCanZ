import { cancelApplyGathering } from "@/api/gathering/cancelApplyGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCancelApplyGatheringMutation = (
  gatheringId: string,
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: () => cancelApplyGathering(gatheringId),
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.cancelApplySuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;

      Alert.alert(t.alerts.error, t.alerts.cancelApplyFail);
    },
  });
};
