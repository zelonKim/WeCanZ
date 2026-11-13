import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptDMRoom } from "@/api/DM/acceptDMRoom";

export const useAcceptDmMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptDMRoom,
    onSuccess: () => {
      alert(t.alerts.acceptSuccess);
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
    },
    onError: (err: any) => {
      alert(t.alerts.acceptFail);
    },
  });
};
