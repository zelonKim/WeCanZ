import { rejectDMRoom } from "@/api/DM/rejectDMRoom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRejectDmMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDMRoom,
    onSuccess: () => {
      alert(t.alerts.rejectSuccess);
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      alert(t.alerts.rejectFail);
    },
  });
};
