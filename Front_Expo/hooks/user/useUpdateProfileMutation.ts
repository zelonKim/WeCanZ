import { updateProfile } from "@/api/user/updateProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useUpdateProfileMutation = (
  t: any,
  onSuccessCallback?: () => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      Alert.alert(t.alertSuccess, t.profileUpdated);
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      Alert.alert(t.alertNotice, t.updateProfileError);
    },
  });
};
