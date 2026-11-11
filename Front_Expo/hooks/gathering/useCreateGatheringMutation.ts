import { createGathering } from "@/api/gathering/createGathering";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCreateGatheringMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      Alert.alert(t.alerts.successCreate);
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t.alerts.failCreate;
      Alert.alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });
};
