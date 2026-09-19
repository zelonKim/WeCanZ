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
  IoImageOutline,
  IoCloseCircle,
} from "react-icons/io5";
import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";
import { useUnreadStore } from "@/stores/useUnreadStore";
import { Socket } from "socket.io-client";
import { uploadProfileImage } from "@/utils/uploadProfileImage";

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

  const socketRef = useRef<Socket | null>(null);
  const messagesBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [deletingMessage, setDeletingMessage] = useState<ChatMessage | null>(
    null,
  );

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const removeUnreadGathering = useUnreadStore(
    (state) => state.removeUnreadGathering,
  );

  useEffect(() => {
    if (!id) return;

    client.patch(`/participant/read/${id}`).catch((err) => {
      console.error("읽음 처리 실패:", err);
    });

    removeUnreadGathering(id);
  }, [id, removeUnreadGathering]);

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
      alert("승인된 참가자만 입장할 수 있습니다.");
      router.replace(`/gathering/${id}`);
    }
  }, [error, id, router]);

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    setTimeout(() => {
      messagesBottomRef.current?.scrollIntoView({ behavior, block: "end" });
    }, 50);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
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
      scrollToBottom("auto");
    };

    const handleDeletedMessage = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["gathering-messages", id],
        (oldMessages = []) => oldMessages.filter((msg) => msg.id !== messageId),
      );
      queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
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

  const handleSelectFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setPendingFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleSelectFile(file);
        break;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectFile(file);
      e.target.value = "";
    }
  };

  const handleSend = async () => {
    if (!socketRef.current || !me?.id) return;

    const textToCategory = messageText.trim();
    if (!textToCategory && !pendingFile) return;

    try {
      setIsUploading(true);

      if (pendingFile) {
        const tempUrl = URL.createObjectURL(pendingFile);
        const data = await uploadProfileImage(tempUrl);

        if (data?.imageUrl) {
          socketRef.current.emit("sendGatheringMessage", {
            gatheringId: id,
            userId: me.id,
            message: data.imageUrl,
          });
        }
        handleRemoveFile();
      }

      if (textToCategory) {
        socketRef.current.emit("sendGatheringMessage", {
          gatheringId: id,
          userId: me.id,
          message: textToCategory,
        });
        setMessageText("");
      }
    } catch (err) {
      console.error("전송 실패:", err);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openDeleteModal = (msg: ChatMessage) => {
    const isMyMessage = String(msg.userId) === String(me?.id);

    if (!isHost && !isMyMessage) {
      return;
    }

    setDeletingMessage(msg);
  };

  const confirmDeleteMessage = () => {
    if (!deletingMessage || !socketRef.current || !me?.id) return;

    socketRef.current.emit("deleteGatheringMessage", {
      gatheringId: id,
      messageId: deletingMessage.id,
      userId: me.id,
    });

    queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
    setDeletingMessage(null);
  };

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isLoading || !gathering || !me) return;

    const isHostUser = gathering.hostId === me.id;
    const isApprovedParticipant = gathering.participants?.some(
      (p) =>
        p.userId === me.id &&
        (p.status === "APPROVED" || p.status === "YES_SHOW"),
    );

    if (!isHostUser && !isApprovedParticipant) {
      router.replace(`/gathering/${id}`);
    } else {
      setIsVerifying(false);
    }
  }, [gathering, me, isLoading, id, router]);

  if (isLoading || isVerifying || !gathering || !me) {
    return null;
  }

  const canSend =
    (Boolean(messageText.trim()) || Boolean(pendingFile)) && !isUploading;

  return (
    <div className="fixed inset-0 left-1/2 -translate-x-1/2 flex flex-col w-full max-w-4xl bg-neutral-900 text-neutral-100 shadow-2xl overflow-hidden">
      {/* 1. 상단 고정 헤더 */}
      <header className="flex items-center justify-between px-4 bg-neutral-900 border-b border-neutral-800 shrink-0 h-14 z-10">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-neutral-800 rounded-full transition text-neutral-200"
        >
          <IoArrowBack size={22} />
        </button>

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="font-bold text-lg truncate max-w-[350px] text-center">
            {gathering ? gathering.title : "벙개 채팅방"}
          </h1>

          {gathering?.participants && (
            <span className="text-[13px] text-neutral-400 font-medium">
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

        <div className="w-8" />
      </header>

      {/* 2. 중앙 스크롤 메시지 영역 */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
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
            const isImage = msg.message.startsWith("http");
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  openDeleteModal(msg);
                }}
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
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                        <IoPerson size={16} className="text-neutral-400" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-neutral-400">
                      {msg.user?.nickname || "알 수 없음"}
                    </span>
                  </div>
                )}

                <div className="relative group">
                  {/* ⚡️ 말풍선 우측 상단에 배치된 Trash 아이콘 */}
                  {(isMyMessage || isHost) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(msg);
                      }}
                      className="absolute -top-0.5 -right-0.5 z-10 opacity-0 group-hover:opacity-95 p-1 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400 rounded-full shadow-md transition-all duration-150"
                      title="메시지 삭제"
                    >
                      <IoTrashOutline size={13} />
                    </button>
                  )}

                  <div
                    className={`rounded-2xl text-base font-medium leading-relaxed break-words max-w-full overflow-hidden ${
                      isImage
                        ? "p-[3px] bg-neutral-800 "
                        : isMyMessage
                          ? "px-3.5 py-2.5 bg-yellow-400 text-neutral-900 rounded-br-sm "
                          : "px-3.5 py-2.5 bg-neutral-800 text-neutral-100 rounded-bl-sm border border-neutral-700/60"
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={msg.message}
                        alt="첨부 이미지"
                        className="max-w-[200px] sm:max-w-[260px] rounded-xl object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={() => setSelectedImage(msg.message)}
                      />
                    ) : (
                      msg.message
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs text-neutral-500 mt-1 px-1 ${
                    isMyMessage ? "text-right" : "text-left"
                  }`}
                >
                  {timeString}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesBottomRef} />
      </main>

      {/* 3. 하단 고정 푸터 */}
      <footer className="p-3 bg-neutral-800 border-t border-neutral-700 shrink-0 z-10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {previewUrl && (
          <div className="relative inline-block mb-2 ml-10">
            <img
              src={previewUrl}
              alt="업로드 미리보기"
              className="w-16 h-16 object-cover rounded-xl border border-neutral-600 shadow-md"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-neutral-900 text-neutral-300 hover:text-red-400 rounded-full transition"
            >
              <IoCloseCircle size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-neutral-400 hover:text-neutral-100 bg-neutral-600/60 hover:bg-yellow-500/90 rounded-full transition"
            title="이미지 첨부"
          >
            <IoImageOutline size={22} />
          </button>

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isUploading ? "전송 중..." : "메시지를 입력하세요..."}
            disabled={isUploading}
            rows={1}
            maxLength={500}
            className="flex-1 bg-neutral-900 text-neutral-100 placeholder-neutral-500 text-sm rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400 max-h-24 scrollbar-none disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
              canSend
                ? "bg-yellow-400 text-neutral-900 hover:bg-yellow-500"
                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <IoSend size={16} />
          </button>
        </div>
      </footer>

      {/* 삭제 확인 모달 UI */}
      {deletingMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeletingMessage(null)}
        >
          <div
            className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 max-w-xs w-full shadow-2xl flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <IoTrashOutline size={24} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">메시지 삭제</h3>
              <p className="text-[15px] text-neutral-400 mt-1">
                선택한 메시지를 삭제하시겠습니까?
              </p>
            </div>

            <div className="flex w-full gap-2 mt-1">
              <button
                onClick={() => setDeletingMessage(null)}
                className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-[15px] font-medium rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[15px] font-semibold rounded-xl transition"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 확대 모달 UI */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-sm font-semibold py-2 px-3.5 bg-neutral-800/80 hover:bg-neutral-600/60 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
