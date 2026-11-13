import { requestFriendship } from "@/api/friend/requestFriendship";
import { useMutation } from "@tanstack/react-query";
import { useSendFriendRequestLanguage } from "../Languages/useSendFriendRequestLanguage";

export const useSendFriendRequestMutation = () => {
  const { t } = useSendFriendRequestLanguage();

  return useMutation({
    mutationFn: requestFriendship,
    onSuccess: () => {
      alert(t.alerts.friendRequestSuccess);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      alert(t.alerts.friendRequestFail);
    },
  });
};
