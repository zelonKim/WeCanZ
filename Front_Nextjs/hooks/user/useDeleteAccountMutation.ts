import { deleteAccount } from "@/api/user/deleteAccount";
import { useMutation } from "@tanstack/react-query";

export const useDeleteAccountMutation = (
  t: any,
  onSuccessCallback?: () => void | Promise<void>,
) => {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      alert(t.deleteAccount);

      if (onSuccessCallback) {
        await onSuccessCallback();
      }
    },
    onError: (error: any) => {
      alert(t.deleteAccountError);
    },
  });
};
