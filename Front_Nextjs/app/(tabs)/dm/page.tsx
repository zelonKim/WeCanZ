"use client";

import { getMyDMRooms } from "@/api/DM/getMyDMRooms";
import { getPendingDMRequests } from "@/api/DM/getPendingDMRequests";
import { getMyInfo } from "@/api/user/getMyInfo";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { DMRoomItem } from "@/components/DmRoomItem";
import { PendingRequestsSection } from "@/components/PendingRequestsSection";
import { renderAvatar } from "@/components/renderAvatar";
import { SendDmModal } from "@/components/SendDmModal";
import { useAcceptDmMutation } from "@/hooks/DM/useAcceptDmMutation";
import { useLeaveDmMutation } from "@/hooks/DM/useLeaveDmMutation";
import { useRejectDmMutation } from "@/hooks/DM/useRejectDmMutation";
import { useRequestDmMutation } from "@/hooks/DM/useRequestDmMutation";
import { useDmLanguage } from "@/hooks/Languages/useDmLanguage";
import { getSocket } from "@/lib/socket";
import { DirectChatRoom } from "@/types/DM/DirectChatRoom";
import { MyInfo } from "@/types/user/MyInfo";
import { useHandlePressDmRoom } from "@/utils/handlePressDmRoom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareMore, Loader2, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function DMPage() {
  const { t, currentLang } = useDmLanguage();
  const queryClient = useQueryClient();
  const { handlePressDmRoom } = useHandlePressDmRoom();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTargetNickname("");
  };

  const { data: myInfo } = useQuery<MyInfo>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const {
    data: pendingRequests = [],
    isPending: isDmRequestsPending,
    refetch: refetchPending,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-requests-pending"],
    queryFn: getPendingDMRequests,
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const {
    data: myDMRooms = [],
    isPending: isMyDmRoomsPending,
    refetch: refetchDMRooms,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-rooms"],
    queryFn: getMyDMRooms,
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const isRefreshing = isDmRequestsPending || isMyDmRoomsPending;

  const onRefresh = () => {
    refetchPending();
    refetchDMRooms();
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: acceptDmMutate } = useAcceptDmMutation(t);
  const { mutate: rejectDmMutate } = useRejectDmMutation(t);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: requestDmMutate } = useRequestDmMutation(() => {
    setIsModalVisible(false);
    setTargetNickname("");
  });

  const handleSendDmRequest = async () => {
    if (!targetNickname.trim()) {
      alert(`${t.alerts.notice}: ${t.alerts.emptyNickname}`);
      return;
    }
    try {
      const userData = await searchUserByNickname(targetNickname.trim());
      requestDmMutate(userData.id);
    } catch (error: any) {
      alert(`${t.alerts.notice}: ${t.alerts.searchFail}`);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: leaveRoomMutate } = useLeaveDmMutation(t);

  const handleLeaveRoom = (roomId: any) => {
    if (
      window.confirm(`${t.alerts.leaveAlertTitle}\n\n${t.alerts.leaveAlertMsg}`)
    ) {
      leaveRoomMutate(roomId);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  // 소켓 이벤트 설정
  useEffect(() => {
    if (!myInfo?.id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("🟢 [Socket] Connected:", socket.id);
      socket.emit("joinUserRoom", { userId: myInfo.id });
    };

    const handleDmListUpdate = (payload: {
      roomId: string;
      lastMessage: any;
      senderId: string;
    }) => {
      console.log("[Socket] dmListUpdated:", payload);

      queryClient.setQueryData<DirectChatRoom[]>(["dm-rooms"], (oldRooms) => {
        if (!oldRooms) return [];

        return oldRooms.map((room) => {
          if (room.id === payload.roomId) {
            const isFromOpponent = payload.senderId !== myInfo.id;
            return {
              ...room,
              lastMessage: payload.lastMessage,
              hasUnread: isFromOpponent ? true : room.hasUnread,
            };
          }
          return room;
        });
      });
    };

    if (socket.connected) {
      socket.emit("joinUserRoom", { userId: myInfo.id });
    }

    socket.on("connect", handleConnect);
    socket.on("dmListUpdated", handleDmListUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("dmListUpdated", handleDmListUpdate);
    };
  }, [myInfo?.id, queryClient]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#121212] shrink-0">
        <h1 className="text-2xl font-extrabold italic tracking-tight text-[#bef408]">
          {t.headerTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalVisible(true)}
            className="p-2 rounded-2xl hover:bg-white/10 transition cursor-pointer text-[#bef408]"
          >
            <MessageSquareMore className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (스크롤) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* 대기 중인 요청 섹션 */}
        <PendingRequestsSection
          pendingRequests={pendingRequests}
          t={t}
          renderAvatar={renderAvatar}
          onAccept={acceptDmMutate}
          onReject={rejectDmMutate}
        />

        {/* 채팅방 목록 헤더 */}
        <div className="mt-2 mb-1">
          <h2 className="text-base font-bold text-white">
            {t.roomsHeader(myDMRooms.length)}
          </h2>
        </div>

        {/* 채팅방 목록 */}
        {isMyDmRoomsPending && myDMRooms.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#bef408]" />
          </div>
        ) : myDMRooms.length > 0 ? (
          <div className="flex flex-col gap-3">
            {myDMRooms.map((item) => (
              <DMRoomItem
                key={item.id}
                item={item}
                renderAvatar={renderAvatar}
                onPressItem={() => handlePressDmRoom(item)}
                onLongPressItem={handleLeaveRoom}
                lang={currentLang}
              />
            ))}
          </div>
        ) : (
          /* 빈 목록 카드 */
          <div className="p-6 items-center justify-center bg-zinc-900 border border-white/5 rounded-2xl text-center">
            <span className="text-sm text-zinc-400">{t.emptyRooms}</span>
          </div>
        )}
      </div>

      {/* DM 생성 모달 */}
      <SendDmModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        targetNickname={targetNickname}
        setTargetNickname={setTargetNickname}
        onSubmit={handleSendDmRequest}
        t={t}
      />
    </div>
  );
}
