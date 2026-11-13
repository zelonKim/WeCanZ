import { cancelApplyGathering } from "@/api/gathering/cancelApplyGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useMutation } from "@tanstack/react-query";

export const useCancelApplyGatheringMutation = (
  gatheringId: string,
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: () => cancelApplyGathering(gatheringId),
    onSuccess: async () => {
      alert(t.alerts.cancelApplySuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      alert(t.alerts.cancelApplyFail);
    },
  });
};
