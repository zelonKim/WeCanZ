import { createReport } from "@/api/user/createReport";

import { useMutation } from "@tanstack/react-query";

import { useCreateReportLanguage } from "../Languages/useCreateReportLanguage";

export const useCreateReportMutation = (
  onSuccessCallback?: () => void,
  onSettledCallback?: () => void,
) => {
  const { t } = useCreateReportLanguage();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      alert(t.alerts.createReportSuccess);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      alert(t.alerts.createReportFail);
    },
    onSettled: () => {
      if (onSettledCallback) {
        onSettledCallback();
      }
    },
  });
};
