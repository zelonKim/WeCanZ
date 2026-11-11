import { leaveDMRoom } from "@/api/DM/leaveDMRoom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useLeaveDmMutation = (t: any, onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveDMRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      Alert.alert(t.alerts.error, t.alerts.leaveFail);
    },
  });
};
