import { useMutation } from "@tanstack/react-query";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { applyGathering } from "@/api/gathering/applyGathering";

export const useApplyGatheringMutation = (
  gatheringId: string,
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: () => applyGathering(gatheringId),
    onSuccess: async () => {
      alert(t.alerts.applySuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.applyFail;
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
