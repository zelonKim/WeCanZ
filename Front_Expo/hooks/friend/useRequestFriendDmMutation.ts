import { Alert } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { User } from "@/types/user/User";
import { requestDM } from "@/api/DM/requestDM";

export const useRequestFriendDmMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      friend,
    }: {
      targetUserId: string;
      friend: User;
    }) => {
      const roomData = await requestDM(targetUserId);
      return { roomData, friend };
    },
    onSuccess: ({ roomData, friend }) => {
      const chatRoomId = roomData.id;
      router.replace({
        pathname: "/DM/[id]",
        params: {
          id: chatRoomId,
          name: friend.nickname,
          profileImage: friend.profileImage || "",
        },
      });
    },
    onError: (err: any) => {
      Alert.alert(
        t.alerts.error,
        err.response?.data?.message || t.alerts.dmFail,
      );
    },
  });
};