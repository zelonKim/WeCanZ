import { rejectDMRoom } from "@/api/DM/rejectDMRoom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useRejectDmMutation = (t: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDMRoom,
    onSuccess: () => {
      Alert.alert(t.alerts.notice, t.alerts.rejectSuccess);
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      Alert.alert(t.alerts.error, t.alerts.rejectFail);
    },
  });
};
