import { requestFriendship } from "@/api/friend/requestFriendship";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useRequestFriendMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestFriendship,
    onSuccess: () => {
      Alert.alert(t.alerts.notice, t.alerts.requestSent);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      Alert.alert(t.alerts.notice, t.alerts.searchFail);
    },
  });
};
