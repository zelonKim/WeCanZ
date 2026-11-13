import { useMutation } from "@tanstack/react-query";
import { editGathering } from "@/api/gathering/editGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";

export const useEditGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: editGathering,
    onSuccess: async () => {
      alert(t.alerts.editSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      alert(t.alerts.editFail);
    },
  });
};
