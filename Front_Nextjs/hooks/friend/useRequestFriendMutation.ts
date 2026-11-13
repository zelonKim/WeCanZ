import { requestFriendship } from "@/api/friend/requestFriendship";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRequestFriendMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestFriendship,
    onSuccess: () => {
      alert(t.alerts.requestSent);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      alert(t.alerts.searchFail);
    },
  });
};
