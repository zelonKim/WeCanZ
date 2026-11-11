import { rejectFriendRequest } from "@/api/friend/rejectFriendRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useRejectFriendMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      Alert.alert(t.alerts.notice, t.alerts.rejectSuccess);
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
    onError: (err: any) => {
      Alert.alert(
        t.alerts.error,
        err.response?.data?.message || t.alerts.rejectFail,
      );
    },
  });
};
