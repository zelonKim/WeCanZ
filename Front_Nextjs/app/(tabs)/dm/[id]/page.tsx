"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IoChevronBack,
  IoLogOutOutline,
  IoPerson,
  IoSend,
} from "react-icons/io5";

import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";

interface MessageUser {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface DirectChatMessage {
  id: string;
  message: string;
  createdAt: string;
  roomId: string;
  senderId: string;
  sender?: MessageUser;
}

export default function DirectChatRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const roomId = params?.id as string;
  const name = searchParams.get("name") || "";
  const profileImage = searchParams.get("profileImage") || "";

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // 내 정보 조회
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await client.get("/user/me");
      return res.data?.data || res.data;
    },
  });

  // 초기 메시지 내역 조회
  const { data: initialMessages = [], isLoading } = useQuery<
    DirectChatMessage[]
  >({
    queryKey: ["dm-messages", roomId],
    queryFn: async () => {
      const { data } = await client.get(
        `/direct-chat/rooms/${roomId}/messages`,
      );
      return data;
    },
    enabled: !!roomId,
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // 스크롤 최하단 이동
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // 1. 소켓 연결 및 이벤트 핸들링
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;
    socket.emit("joinDirectRoom", { roomId });

    const handleNewMessage = (newMessage: DirectChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;

        const filtered = prev.filter((msg) => !msg.id.startsWith("temp-"));
        return [...filtered, newMessage];
      });
    };

    const handleDeletedMessage = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    socket.on("newDirectMessage", handleNewMessage);
    socket.on("directMessageDeleted", handleDeletedMessage);

    return () => {
      socket.emit("leaveDirectRoom", { roomId });
      socket.off("newDirectMessage", handleNewMessage);
      socket.off("directMessageDeleted", handleDeletedMessage);
    };
  }, [roomId]);

  // 2. 웹 네트워크 상태 감지 및 재연결
  useEffect(() => {
    if (!roomId) return;

    const handleOnline = () => {
      const socket = socketRef.current;
      if (socket && !socket.connected) {
        socket.connect();
        socket.emit("joinDirectRoom", { roomId });
        queryClient.invalidateQueries({ queryKey: ["dm-messages", roomId] });
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [roomId, queryClient]);

  // 메시지 전송
  const handleSend = () => {
    if (!inputText.trim() || !myInfo?.id || !roomId || !socketRef.current) {
      return;
    }

    const messageText = inputText.trim();
    setInputText("");

    const tempMessage: DirectChatMessage = {
      id: `temp-${Date.now()}`,
      message: messageText,
      createdAt: new Date().toISOString(),
      roomId,
      senderId: myInfo.id,
      sender: {
        id: myInfo.id,
        nickname: "",
      },
    };

    setMessages((prev) => [...prev, tempMessage]);

    socketRef.current.emit("sendDirectMessage", {
      roomId,
      senderId: myInfo.id,
      message: messageText,
    });
  };

  // 엔터키 입력 처리 (한글 중복 전송 방지)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지 삭제 (우클릭 / 컨텍스트 메뉴)
  const handleRightClickMessage = (
    e: React.MouseEvent,
    msg: DirectChatMessage,
  ) => {
    e.preventDefault();
    if (myInfo?.id && msg.senderId !== myInfo.id) return;

    if (confirm("이 메시지를 삭제하시겠습니까?")) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      socketRef.current?.emit("deleteDirectMessage", {
        roomId,
        messageId: msg.id,
        userId: myInfo?.id,
      });
    }
  };

  // 방 나가기
  const leaveRoomMutation = useMutation({
    mutationFn: () => client.delete(`/direct-chat/rooms/${roomId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
      router.back();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "방 나가기에 실패했습니다.");
    },
  });

  const handleLeaveRoom = () => {
    if (confirm("정말 메시지방을 나가시겠습니까?")) {
      leaveRoomMutation.mutate();
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 차단 유저 조회
  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const res = await client.get("/friendship/blocked");
      return res.data?.data || res.data;
    },
  });

  // 상대방 User ID 도출
  const targetUserId = useMemo(() => {
    const otherMsg = messages.find(
      (msg) => String(msg.senderId) !== String(myInfo?.id),
    );
    return otherMsg?.senderId || otherMsg?.sender?.id;
  }, [messages, myInfo]);

  // 차단 여부 확인
  const isBlocked = useMemo(() => {
    if (!targetUserId || !blockedUsers.length) return false;

    return blockedUsers.some(
      (item: any) => String(item.receiver?.id) === String(targetUserId),
    );
  }, [targetUserId, blockedUsers]);

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col max-w-4xl mx-auto bg-neutral-900 text-white shadow-2xl">
      {/* 헤더 */}
      <header className="h-13 flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700/80 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-neutral-700/50 rounded-full transition"
        >
          <IoChevronBack size={24} className="text-white" />
        </button>

        <div className="flex items-center gap-2">
          {profileImage ? (
            <img
              src={profileImage}
              alt="프로필"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
              <IoPerson size={18} className="text-neutral-300" />
            </div>
          )}
          <span className="font-semibold text-base truncate max-w-[160px]">
            {name || "알 수 없음"}
          </span>
        </div>

        <button
          onClick={handleLeaveRoom}
          className="p-1 hover:bg-neutral-700/50 rounded-full transition text-red-500"
          title="방 나가기"
        >
          <IoLogOutOutline size={24} />
        </button>
      </header>

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
          </div>
        ) : (
          messages.map((item) => {
            const isMyMessage =
              (item.senderId && item.senderId === myInfo?.id) ||
              (item.sender?.id && item.sender.id === myInfo?.id);

            return (
              <div
                key={item.id}
                onContextMenu={(e) => handleRightClickMessage(e, item)}
                className={`flex flex-col max-w-[75%] ${
                  isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMyMessage
                      ? "bg-yellow-400 text-neutral-900 rounded-br-xs font-medium"
                      : "bg-neutral-800 text-neutral-100 rounded-bl-xs border border-neutral-700/60"
                  }`}
                >
                  {item.message}
                </div>

                <span
                  className={`text-[10px] text-neutral-500 mt-1 px-1 ${
                    isMyMessage ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(item.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 하단 입력 영역 */}
      <footer className="p-3 bg-neutral-800 border-t border-neutral-700/80 shrink-0">
        {isBlocked ? (
          <div className="w-full py-2.5 bg-neutral-700/50 rounded-2xl flex items-center justify-center">
            <span className="text-neutral-400 text-sm font-medium">
              차단한 유저와는 대화할 수 없습니다.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              maxLength={500}
              className="flex-1 bg-neutral-900 text-white placeholder-neutral-500 text-sm rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400 max-h-24 scrollbar-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
                inputText.trim()
                  ? "bg-yellow-400 text-neutral-900 hover:bg-yellow-500"
                  : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <IoSend size={16} />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
