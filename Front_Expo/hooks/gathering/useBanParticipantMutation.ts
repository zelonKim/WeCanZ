import { banParticipant } from "@/api/gathering/banParticipant";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useBanParticipantMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: banParticipant,
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.banSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.banFail;
      Alert.alert(t.alerts.error, Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
