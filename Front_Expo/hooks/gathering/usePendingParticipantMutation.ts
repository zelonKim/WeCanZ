import { PendingParticipant } from "@/api/gathering/pendingarticipant";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const usePendingParticipantMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: PendingParticipant,
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.pendingSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.pendingFail;
      Alert.alert(t.alerts.error, Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
