import { cancelGathering } from "@/api/gathering/cancelGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";

export const useCancelGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: cancelGathering,
    onSuccess: async () => {
      alert(t.alerts.gatheringCancelSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.gatheringCancelFail;
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
