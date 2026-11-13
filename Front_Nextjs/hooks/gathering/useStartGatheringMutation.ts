import { useMutation } from "@tanstack/react-query";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { startGathering } from "@/api/gathering/startGathering";

export const useStartGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: startGathering,
    onSuccess: async () => {
      alert(t.alerts.startSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || t.alerts.startFail;
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
