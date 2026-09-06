
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useUnreadStore } from "@/stores/useUnreadStore";

export default function GlobalSocketListener({
  myGatheringIds,
  currentUserId,
}: {
  myGatheringIds: string[];
  currentUserId: string;
}) {

  const pathname = usePathname();

  const addUnreadGathering = useUnreadStore((state) => state.addUnreadGathering);


  useEffect(() => {
    if (!myGatheringIds || myGatheringIds.length === 0) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    // 1. 유저가 참가 중인 모든 모임 룸에 입장
    myGatheringIds.forEach((id) => {
      socket.emit("joinGatheringRoom", { gatheringId: id });
    });


    // 2. 메시지 수신 감지
    const handleNewMessage = (newMessage: { roomId?: string; userId?: string; gatheringId?: string }) => {
      const targetGatheringId = newMessage.gatheringId; 

      // 내가 보낸 메시지가 아니고, 현재 그 채팅방(/gathering/[id]/chat) 보고 있는 게 아닐 때 전역 스토어에 추가
      const currentChatPath = `/gathering/${targetGatheringId}/chat`;
      
      if (newMessage.userId !== currentUserId && pathname !== currentChatPath) {
        if (targetGatheringId) {
          addUnreadGathering(targetGatheringId);
        }
      }
    };

    socket.on("newGatheringMessage", handleNewMessage);

    return () => {
      socket.off("newGatheringMessage", handleNewMessage);
    };
  }, [myGatheringIds, currentUserId, pathname, addUnreadGathering]);

  return null; 
}