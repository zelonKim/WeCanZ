import { PendingParticipant } from "@/api/gathering/pendingarticipant";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";

export const usePendingParticipantMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: PendingParticipant,
    onSuccess: async () => {
      alert(t.alerts.pendingSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.pendingFail;
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
