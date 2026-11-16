import { useMutation } from "@tanstack/react-query";
import { User } from "@/types/user/User";
import { requestDM } from "@/api/DM/requestDM";
import { useRouter } from "next/navigation";

export const useRequestFriendDmMutation = (t: any) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      friend,
    }: {
      targetUserId: string;
      friend: any;
    }) => {
      const roomData = await requestDM(targetUserId);
      return { roomData, friend };
    },
    onSuccess: ({ roomData, friend }) => {
      const chatRoomId = roomData.id;

      const queryString = new URLSearchParams({
        name: friend.nickname,
        profileImage: friend.profileImage || "",
      }).toString();

      router.push(`/dm/${chatRoomId}?${queryString}`);
    },
    onError: (err: any) => {
      alert(t.alerts.dmFail);
    },
  });
};
