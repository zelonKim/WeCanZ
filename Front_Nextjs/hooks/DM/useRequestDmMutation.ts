import { requestDM } from "@/api/DM/requestDM";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRequestDmLanguage } from "../Languages/useRequestDmLanguage";

export const useRequestDmMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { t } = useRequestDmLanguage();

  return useMutation({
    mutationFn: requestDM,
    onSuccess: () => {
      alert(t.alerts.requestSent);
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      alert(t.alerts.requestFail);
    },
  });
};
