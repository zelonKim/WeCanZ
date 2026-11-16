import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unblockUser } from "@/api/user/unblockUser";

export const useUnblockUserMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      alert(t.alerts.unblockSuccess);
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      alert(t.alerts.unblockFail);
    },
  });
};
