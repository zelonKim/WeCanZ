import { leaveDMRoom } from "@/api/DM/leaveDMRoom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLeaveDmMutation = (t: any, onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveDMRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      alert(t.alerts.error);
    },
  });
};
