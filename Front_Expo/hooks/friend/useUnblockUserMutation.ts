import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unblockUser } from "@/api/user/unblockUser";

export const useUnblockUserMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.unblockSuccess);
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      Alert.alert(
        t.alerts.error,
        err.response?.data?.message || t.alerts.unblockFail,
      );
    },
  });
};