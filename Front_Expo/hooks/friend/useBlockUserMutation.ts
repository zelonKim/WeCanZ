import { blockFriend } from "@/api/friend/blcokFriend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useBlockUserLanguage } from "../Languages/useBlockUserLanguage";

export const useBlockUserMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { t } = useBlockUserLanguage();

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
      Alert.alert(t.alerts.error, t.alerts.blockFail);
    },
  });
};
