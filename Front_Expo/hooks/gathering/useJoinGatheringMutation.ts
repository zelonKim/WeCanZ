import { searchGatheringByCode } from "@/api/gathering/searchGatheringByCode";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useJoinGatheringMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const router = useRouter();

  return useMutation({
    mutationFn: searchGatheringByCode,
    onSuccess: (data) => {
      const gatheringId = data.id;

      if (onSuccessCallback) {
        onSuccessCallback();
      }

      router.push(`/gathering/${gatheringId}`);
    },
    onError: (error: any) => {
      Alert.alert(t.error, t.alerts.roomNotFound);
    },
  });
};
