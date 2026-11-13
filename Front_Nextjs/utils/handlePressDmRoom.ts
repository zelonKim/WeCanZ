import { DirectChatRoom } from "@/types/DM/DirectChatRoom";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useHandlePressDmRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePressDmRoom = (item: DirectChatRoom) => {
    const partner = item.targetUser;

    queryClient.setQueryData<DirectChatRoom[]>(["dm-rooms"], (oldRooms) =>
      oldRooms?.map((r) => (r.id === item.id ? { ...r, hasUnread: false } : r)),
    );

    const queryParams = new URLSearchParams({
      name: partner?.nickname || "",
      profileImage: partner?.profileImage || "",
    }).toString();

    router.push(`/dm/${item.id}?${queryParams}`);
  };

  return { handlePressDmRoom };
};
