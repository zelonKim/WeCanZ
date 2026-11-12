import { requestFriendship } from "@/api/friend/requestFriendship";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useSendFriendRequestLanguage } from "../Languages/useSendFriendRequestLanguage";

export const useSendFriendRequestMutation = () => {
  const { t } = useSendFriendRequestLanguage();

  return useMutation({
    mutationFn: requestFriendship,
    onSuccess: () => {
      Alert.alert(t.alerts.success, t.alerts.friendRequestSuccess);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      Alert.alert(t.alerts.error, t.alerts.friendRequestFail);
    },
  });
};
