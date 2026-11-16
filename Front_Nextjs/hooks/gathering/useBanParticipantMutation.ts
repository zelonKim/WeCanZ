import { banParticipant } from "@/api/gathering/banParticipant";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";

export const useBanParticipantMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: banParticipant,
    onSuccess: async () => {
      alert(t.alerts.banSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      alert(t.alerts.banFail);
    },
  });
};
