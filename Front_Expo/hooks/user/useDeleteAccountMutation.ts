import { deleteAccount } from "@/api/user/deleteAccount";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useDeleteAccountMutation = (
  t: any,
  onSuccessCallback?: () => void | Promise<void>,
) => {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      Alert.alert(t.alertNotice, t.deleteAccount);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (error: any) => {
      Alert.alert(t.alertError, t.deleteAccountError);
    },
  });
};
