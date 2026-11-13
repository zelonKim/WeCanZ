import { useMutation } from "@tanstack/react-query";
import { approveParticipant } from "@/api/gathering/approveParticipant";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";

export const useApproveParticipantMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: approveParticipant,
    onSuccess: async () => {
      alert(t.alerts.approveSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.approveFail;
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
