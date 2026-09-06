"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IoArrowBack,
  IoSend,
  IoPerson,
  IoChatbubbleEllipsesOutline,
  IoTrashOutline,
} from "react-icons/io5";

import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    nickname?: string;
    profileImage?: string;
  };
}

interface Participant {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "BANNED" | "YES_SHOW" | "NO_SHOW";
  user?: {
    id: string;
    nickname: string;
    profileImage?: string;
  };
}

interface Gathering {
  id: string;
  title: string;
  hostId: string;
  participants?: Participant[];
}

interface UserProfile {
  id: string;
  nickname?: string;
}

export default function GatheringChatPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const [messageText, setMessageText] = useState("");

  const { data: me } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const { data: gathering } = useQuery<Gathering>({
    queryKey: ["gathering", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery<ChatMessage[]>({
    queryKey: ["gathering-messages", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering-chat/${id}/messages`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      alert("승인된 참가자만 입장할 수 있습니다."); // 필요 시 유지
      router.replace(`/gathering/${id}`);
    }
  }, [error, id, router]); // gatheringId -> id로 수정

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  useEffect(() => {
    if (!id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;

    socket.emit("joinGatheringRoom", { gatheringId: id });

    const handleNewMessage = (newMessage: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["gathering-messages", id],
        (oldMessages = []) => {
          if (oldMessages.some((msg) => msg.id === newMessage.id)) {
            return oldMessages;
          }
          return [...oldMessages, newMessage];
        },
      );
    };

    const handleDeletedMessage = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["gathering-messages", id],
        (oldMessages = []) => oldMessages.filter((msg) => msg.id !== messageId),
      );
    };

    socket.on("newGatheringMessage", handleNewMessage);
    socket.on("gatheringMessageDeleted", handleDeletedMessage);

    return () => {
      socket.emit("leaveGatheringRoom", { gatheringId: id });
      socket.off("newGatheringMessage", handleNewMessage);
      socket.off("gatheringMessageDeleted", handleDeletedMessage);
    };
  }, [id, queryClient]);

  useEffect(() => {
    if (!id) return;

    const handleOnline = () => {
      const socket = socketRef.current;
      if (socket && !socket.connected) {
        socket.connect();
        socket.emit("joinGatheringRoom", { gatheringId: id });
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [id, queryClient]);

  const handleSend = () => {
    if (!messageText.trim() || !socketRef.current || !me?.id) return;

    socketRef.current.emit("sendGatheringMessage", {
      gatheringId: id,
      userId: me.id,
      message: messageText.trim(),
    });

    setMessageText("");
  };

  // 💡 [핵심 해결 1] 한글 입력 조합(isComposing) 체크로 중복 전송 방지
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 글자 조합 중일 때는 무시

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeletePrompt = (msg: ChatMessage) => {
    const isMyMessage = String(msg.userId) === String(me?.id);

    if (!isHost && !isMyMessage) {
      alert("본인이 작성한 메시지만 삭제할 수 있습니다.");
      return;
    }

    if (confirm("이 메시지를 삭제하시겠습니까?")) {
      if (!socketRef.current || !me?.id) return;

      socketRef.current.emit("deleteGatheringMessage", {
        gatheringId: id,
        messageId: msg.id,
        userId: me.id,
      });
    }
  };

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isLoading || !gathering || !me) return;

    const isHost = gathering.hostId === me.id;
    const isApprovedParticipant = gathering.participants?.some(
      (p) =>
        p.userId === me.id &&
        (p.status === "APPROVED" || p.status === "YES_SHOW"),
    );

    if (!isHost && !isApprovedParticipant) {
      router.replace(`/gathering/${id}`);
    } else {
      setIsVerifying(false);
    }
  }, [gathering, me, isLoading, id, router]);

  if (isLoading || isVerifying || !gathering || !me) {
    return null;
  }

  return (
    /* 💡 [핵심 해결 2] pb-16 (약 64px)을 추가하여 하단 네비게이션 바 높이만큼 잘리지 않도록 여백 확보 */
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-neutral-900 text-neutral-100 shadow-2xl">
      <header className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 shrink-0">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-neutral-800 rounded-full transition"
        >
          <IoArrowBack size={22} />
        </button>

        {/* 타이틀 & 참가자 수 (세로 정렬) */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="font-bold text-base truncate max-w-[200px]">
            {gathering ? gathering.title : "벙개 채팅방"}
          </h1>

          {gathering?.participants && (
            <span className="text-xs text-neutral-400 font-medium">
              참가자{" "}
              {
                gathering.participants.filter(
                  (p) => p.status === "APPROVED" || p.status === "YES_SHOW",
                ).length
              }
              명
            </span>
          )}
        </div>

        {/* 오른쪽 대칭용 레이아웃 여백 */}
        <div className="w-8" />
      </header>

      {/* 채팅 메시지 영역 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2">
            <IoChatbubbleEllipsesOutline size={48} />
            <p className="text-sm">첫 메시지를 남겨보세요!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = String(msg.userId) === String(me?.id);
            const timeString = new Date(msg.createdAt).toLocaleTimeString(
              "ko-KR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${
                  isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {!isMyMessage && (
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.user?.profileImage ? (
                      <img
                        src={msg.user.profileImage}
                        alt="프로필"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center">
                        <IoPerson size={14} className="text-neutral-400" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-neutral-300">
                      {msg.user?.nickname || "알 수 없음"}
                    </span>
                  </div>
                )}

                <div className="relative group flex items-end gap-1">
                  {(isMyMessage || isHost) && (
                    <button
                      onClick={() => handleDeletePrompt(msg)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition"
                      title="메시지 삭제"
                    >
                      <IoTrashOutline size={14} />
                    </button>
                  )}

                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleDeletePrompt(msg);
                    }}
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words max-w-full ${
                      isMyMessage
                        ? "bg-yellow-400 text-neutral-900 rounded-br-sm font-medium"
                        : "bg-neutral-800 text-neutral-100 rounded-bl-sm border border-neutral-700/60"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>

                <span
                  className={`text-[10px] text-neutral-500 mt-1 px-1 ${
                    isMyMessage ? "text-right" : "text-left"
                  }`}
                >
                  {timeString}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 하단 입력 영역 */}
      <footer className="p-3 bg-neutral-800 border-t border-neutral-700 shrink-0">
        <div className="flex items-center gap-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            maxLength={500}
            className="flex-1 bg-neutral-900 text-neutral-100 placeholder-neutral-500 text-sm rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400 max-h-24 scrollbar-none"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
              messageText.trim()
                ? "bg-yellow-400 text-neutral-900 hover:bg-yellow-500"
                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <IoSend size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
