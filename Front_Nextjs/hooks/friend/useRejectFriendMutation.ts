import { rejectFriendRequest } from "@/api/friend/rejectFriendRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRejectFriendMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      alert(t.alerts.rejectSuccess);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
    onError: (err: any) => {
      alert(t.alerts.rejectFail);
    },
  });
};
