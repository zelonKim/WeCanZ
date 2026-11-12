import { createReport } from "@/api/user/createReport";

import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useCreateReportLanguage } from "../Languages/useCreateReportLanguage";

export const useCreateReportMutation = (
  onSuccessCallback?: () => void,
  onSettledCallback?: () => void,
) => {
  const { t } = useCreateReportLanguage();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.createReportSuccess);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      Alert.alert(t.alerts.error, t.alerts.createReportFail);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
