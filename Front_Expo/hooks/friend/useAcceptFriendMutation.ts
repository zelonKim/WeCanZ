import { acceptFriendRequest } from "@/api/friend/acceptFriendRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useAcceptFriendMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.acceptSuccess);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      Alert.alert(t.alerts.error, t.alerts.acceptFail);
    },
  });
};
