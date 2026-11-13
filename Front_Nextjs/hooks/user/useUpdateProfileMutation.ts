import { updateProfile } from "@/api/user/updateProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfileMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      alert(t.alerts.profileUpdated);
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      alert(t.alerts.updateProfileError);
    },
  });
};
