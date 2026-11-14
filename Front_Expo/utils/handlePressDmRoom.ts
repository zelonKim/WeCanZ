import { queryClient } from "@/api/api-provider";
import { DirectChatRoom } from "@/types/DM/DirectChatRoom";
import { router } from "expo-router";

export const handlePressDmRoom = (item: DirectChatRoom) => {
  const partner = item.targetUser;

  queryClient.setQueryData<DirectChatRoom[]>(["dm-rooms"], (oldRooms) =>
    oldRooms?.map((r) => (r.id === item.id ? { ...r, hasUnread: false } : r)),
  );

  router.replace({
    pathname: "/DM/[id]",
    params: {
      id: item.id,
      name: partner?.nickname,
      profileImage: partner?.profileImage,
    },
  });
};
