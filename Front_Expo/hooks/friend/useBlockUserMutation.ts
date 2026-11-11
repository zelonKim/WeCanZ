import { blockFriend } from "@/api/friend/blcokFriend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useBlockUserMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockFriend,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.blockSuccess);
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      Alert.alert(
        t.alerts.error,
        err.response?.data?.message || t.alerts.blockFail,
      );
    },
  });
};
