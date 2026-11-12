import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

import { editGathering } from "@/api/gathering/editGathering";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";

export const useEditGatheringMutation = (
  onSuccessCallback?: () => Promise<void> | void,
) => {
  const { t } = useGatheringDetailLanguage();

  return useMutation({
    mutationFn: editGathering,
    onSuccess: async () => {
      Alert.alert(t.alerts.success, t.alerts.editSuccess);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      Alert.alert(t.alerts.error, t.alerts.editFail);
    },
  });
};
