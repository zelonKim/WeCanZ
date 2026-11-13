import { acceptFriendRequest } from "@/api/friend/acceptFriendRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAcceptFriendMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      alert(t.alerts.acceptSuccess);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      alert(t.alerts.acceptFail);
    },
  });
};
