import { blockFriend } from "@/api/friend/blcokFriend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlockUserLanguage } from "../Languages/useBlockUserLanguage";

export const useBlockUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { t } = useBlockUserLanguage();

  return useMutation({
    mutationFn: blockFriend,
    onSuccess: () => {
      alert(t.alerts.blockSuccess);
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      alert(t.alerts.blockFail);
    },
  });
};
