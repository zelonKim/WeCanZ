"use client";

import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChatbubbleEllipsesOutline, Person } from "react-ionicons";

interface User {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface DirectChatRoom {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user1Id: string;
  user2Id: string;
  user1?: User;
  user2?: User;
  sender?: User;
  targetUser?: User;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  hasUnread?: boolean;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

export default function DMScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");

  // 1. 들어온 DM 요청 목록 조회
  const {
    data: pendingRequests = [],
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-requests-pending"],
    queryFn: async () => {
      const { data } = await client.get("/direct-chat/requests/pending");
      return data;
    },
  });

  // 2. 수락된 DM 목록 조회
  const {
    data: myDMRooms = [],
    isLoading: isRoomsLoading,
    refetch: refetchRooms,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-rooms"],
    queryFn: async () => {
      const { data } = await client.get("/direct-chat/rooms");
      return data;
    },
  });

  // 내 정보 조회
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 3. DM 요청 수락
  const acceptMutation = useMutation({
    mutationFn: (roomId: string) =>
      client.patch(`/direct-chat/${roomId}/accept`),
    onSuccess: () => {
      alert("DM 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "수락에 실패했습니다.");
    },
  });

  // 4. DM 요청 거절
  const rejectMutation = useMutation({
    mutationFn: (roomId: string) =>
      client.patch(`/direct-chat/${roomId}/reject`),
    onSuccess: () => {
      alert("DM 요청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "거절에 실패했습니다.");
    },
  });

  // 5. DM 요청 보내기 Mutation
  const requestDmMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.post(`/direct-chat/request/${targetUserId}`),
    onSuccess: () => {
      alert("DM 요청을 보냈습니다.");
      setIsModalVisible(false);
      setTargetNickname("");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "DM 요청에 실패했습니다.");
    },
  });

  // 닉네임 검색 후 DM 요청 처리
  const handleSendDmRequest = async () => {
    if (!targetNickname.trim()) {
      alert("상대방 닉네임을 입력해주세요.");
      return;
    }

    try {
      const res = await client.get(
        `/user/search/${encodeURIComponent(targetNickname.trim())}`,
      );
      requestDmMutation.mutate(res.data.id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "존재하지 않거나 검색할 수 없는 유저입니다.";
      alert(errorMessage);
    }
  };

  // 소켓 연결 및 실시간 DM 목록 업데이트 수신
  useEffect(() => {
    if (!myInfo?.id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("joinUserRoom", { userId: myInfo.id });
    };

    const handleDmListUpdate = (payload: {
      roomId: string;
      lastMessage: any;
      senderId: string;
    }) => {
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

  const renderAvatar = (profileImage?: string) => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt="avatar"
          className="w-11 h-11 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center">
        <Person color="#8E8E93" height="22px" width="22px" />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen text-white max-w-5xl mx-auto px-4 py-1">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between py-3 border-b border-zinc-800 mb-4">
        <h1 className="text-[28px] text-[#bef408] font-bold italic">DM</h1>
        <button
          onClick={() => setIsModalVisible(true)}
          className="cursor-pointer p-2 hover:bg-zinc-800 rounded-2xl transition"
        >
          <ChatbubbleEllipsesOutline
            color="#bef408"
            height="24px"
            width="24px"
          />
        </button>
      </div>

      <div className="space-y-6 pb-20">
        {/* 받은 DM 요청 섹션 */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            받은 DM 요청 ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center text-zinc-400 text-base">
              받은 DM 요청이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const requester = req.sender || req.user1;

                return (
                  <div
                    key={req.id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(requester?.profileImage)}
                      <span className="font-semibold text-white text-base">
                        {requester?.nickname || "알 수 없는 유저"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptMutation.mutate(req.id)}
                        className="bg-blue-600 px-3.5 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                      >
                        수락
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(req.id)}
                        className="bg-zinc-800 px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 대화 중인 DM 섹션 */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            대화 중인 DM ({myDMRooms.length})
          </h2>

          {myDMRooms.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-base">
              참여 중인 DM 대화방이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myDMRooms.map((item) => {
                const partner = item.targetUser;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      queryClient.setQueryData<DirectChatRoom[]>(
                        ["dm-rooms"],
                        (oldRooms) =>
                          oldRooms?.map((r) =>
                            r.id === item.id ? { ...r, hasUnread: false } : r,
                          ),
                      );
                      router.push(
                        `/dm/${item.id}?name=${encodeURIComponent(partner?.nickname || "")}&profileImage=${encodeURIComponent(partner?.profileImage || "")}`,
                      );
                    }}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:border-[#FFE600] transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      <div className="relative shrink-0">
                        {renderAvatar(partner?.profileImage)}
                        {item.hasUnread && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-900">
                            N
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-base truncate">
                            {partner?.nickname}
                          </span>
                          {item.hasUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>

                        {item.lastMessage && (
                          <p
                            className={`text-xs truncate ${item.hasUnread ? "text-zinc-200 font-medium" : "text-zinc-400"}`}
                          >
                            {item.lastMessage.content ||
                              (item.lastMessage as any).message}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.lastMessage?.createdAt && (
                      <span className="text-[11px] text-zinc-500 shrink-0 self-start">
                        {formatTime(item.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DM 요청 모달 */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-center mb-1">✉️ DM 요청</h3>
            <p className="text-sm text-zinc-400 text-center mb-5">
              DM을 요청할 유저의 닉네임을 입력해주세요.
            </p>

            <input
              type="text"
              placeholder="닉네임 입력"
              value={targetNickname}
              onChange={(e) => setTargetNickname(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-[#FFE600] mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsModalVisible(false);
                  setTargetNickname("");
                }}
                className="flex-1 bg-zinc-800 py-3 rounded-xl font-bold text-[15px] text-zinc-300 hover:bg-zinc-700 transition"
              >
                취소
              </button>
              <button
                onClick={handleSendDmRequest}
                className="flex-1 bg-[#bef408] py-3 rounded-xl font-bold text-[15px] text-black hover:opacity-90 transition"
              >
                요청 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
