import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { markParticipantNoShow } from "@/api/gathering/markParticipantNoShow";

export const useNoShowParticipantMutation = (
  gatheringId: string,
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markParticipantNoShow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gathering", gatheringId] });

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.noShowFail;
      Alert.alert(t.alerts.error, Array.isArray(msg) ? msg[0] : msg);
    },
  });
};