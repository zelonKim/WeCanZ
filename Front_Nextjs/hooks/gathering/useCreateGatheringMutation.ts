import { createGathering } from "@/api/gathering/createGathering";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateGatheringMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      alert(t.alerts.successCreate);
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t.alerts.failCreate;
      alert(t.alerts.failCreate);
    },
  });
};
