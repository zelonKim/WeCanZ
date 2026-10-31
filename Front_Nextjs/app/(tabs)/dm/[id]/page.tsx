"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IoChevronBack,
  IoLogOutOutline,
  IoPerson,
  IoSend,
  IoImageOutline,
  IoCloseCircle,
  IoTrashOutline,
} from "react-icons/io5";

import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";
import { uploadProfileImage } from "@/utils/uploadProfileImage";

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ⚡️ 삭제 확인 모달 대상 State
  const [deletingMessage, setDeletingMessage] =
    useState<DirectChatMessage | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // 소켓 연결 및 이벤트
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
      // ⚡️ 소켓 이벤트 수신 시 Query 캐시 재갱신
      queryClient.invalidateQueries({ queryKey: ["dm-messages", roomId] });
    };

    socket.on("newDirectMessage", handleNewMessage);
    socket.on("directMessageDeleted", handleDeletedMessage);

    return () => {
      socket.emit("leaveDirectRoom", { roomId });
      socket.off("newDirectMessage", handleNewMessage);
      socket.off("directMessageDeleted", handleDeletedMessage);
    };
  }, [roomId, queryClient]);

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
    if (!myInfo?.id || !roomId || !socketRef.current) return;

    const textToCategory = inputText.trim();
    if (!textToCategory && !pendingFile) return;

    try {
      setIsUploading(true);

      if (pendingFile) {
        const tempUrl = URL.createObjectURL(pendingFile);
        const data = await uploadProfileImage(tempUrl);

        if (data?.imageUrl) {
          const tempImageMsg: DirectChatMessage = {
            id: `temp-${Date.now()}-img`,
            message: data.imageUrl,
            createdAt: new Date().toISOString(),
            roomId,
            senderId: myInfo.id,
            sender: { id: myInfo.id, nickname: "" },
          };
          setMessages((prev) => [...prev, tempImageMsg]);

          socketRef.current.emit("sendDirectMessage", {
            roomId,
            senderId: myInfo.id,
            message: data.imageUrl,
          });
        }
        handleRemoveFile();
      }

      if (textToCategory) {
        setInputText("");
        const tempTextMsg: DirectChatMessage = {
          id: `temp-${Date.now()}-text`,
          message: textToCategory,
          createdAt: new Date().toISOString(),
          roomId,
          senderId: myInfo.id,
          sender: { id: myInfo.id, nickname: "" },
        };
        setMessages((prev) => [...prev, tempTextMsg]);

        socketRef.current.emit("sendDirectMessage", {
          roomId,
          senderId: myInfo.id,
          message: textToCategory,
        });
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

  // ⚡️ 우클릭 시 삭제 모달 오픈
  const handleRightClickMessage = (
    e: React.MouseEvent,
    msg: DirectChatMessage,
  ) => {
    e.preventDefault();
    if (myInfo?.id && msg.senderId !== myInfo.id) return;
    setDeletingMessage(msg);
  };

  // ⚡️ 삭제 확정 실행 및 React Query 재갱신
  const confirmDeleteMessage = () => {
    if (!deletingMessage || !myInfo?.id || !socketRef.current) return;

    const targetId = deletingMessage.id;

    // 1. 상태 즉시 반영
    setMessages((prev) => prev.filter((m) => m.id !== targetId));

    // 2. 소켓 삭제 요청
    socketRef.current.emit("deleteDirectMessage", {
      roomId,
      messageId: targetId,
      userId: myInfo.id,
    });

    // 3. React Query 캐시 재갱신
    queryClient.invalidateQueries({ queryKey: ["dm-messages", roomId] });

    // 4. 모달 닫기
    setDeletingMessage(null);
  };

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

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const res = await client.get("/friendship/blocked");
      return res.data?.data || res.data;
    },
  });

  const targetUserId = useMemo(() => {
    const otherMsg = messages.find(
      (msg) => String(msg.senderId) !== String(myInfo?.id),
    );
    return otherMsg?.senderId || otherMsg?.sender?.id;
  }, [messages, myInfo]);

  const isBlocked = useMemo(() => {
    if (!targetUserId || !blockedUsers.length) return false;

    return blockedUsers.some(
      (item: any) => String(item.receiver?.id) === String(targetUserId),
    );
  }, [targetUserId, blockedUsers]);

  const canSend =
    (Boolean(inputText.trim()) || Boolean(pendingFile)) && !isUploading;

  return (
    <div className="fixed inset-0 left-1/2 -translate-x-1/2 flex flex-col w-full max-w-4xl bg-neutral-900 text-neutral-100 shadow-2xl overflow-hidden">
      <header className="h-13 flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700/80 shrink-0">
        <button
          onClick={() => router.back()}
          className="cursor-pointer p-1 hover:bg-neutral-700/50 rounded-full transition"
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
          className="cursor-pointer p-1 hover:bg-neutral-700/50 rounded-full transition text-red-500"
          title="방 나가기"
        >
          <IoLogOutOutline size={24} />
        </button>
      </header>

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
          </div>
        ) : (
          messages.map((item) => {
            const isMyMessage =
              (item.senderId && item.senderId === myInfo?.id) ||
              (item.sender?.id && item.sender.id === myInfo?.id);
            const isImage = item.message.startsWith("http");

            return (
              <div
                key={item.id}
                onContextMenu={(e) => handleRightClickMessage(e, item)}
                className={`flex flex-col max-w-[75%] ${
                  isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`text-base leading-relaxed break-words rounded-2xl overflow-hidden group relative ${
                    isImage
                      ? "p-1 bg-neutral-800 border border-neutral-700/60"
                      : isMyMessage
                        ? "px-3.5 py-2.5 bg-[#bef408] text-neutral-900 rounded-br-xs font-medium"
                        : "px-3.5 py-2.5 bg-neutral-800 text-neutral-100 rounded-bl-xs border border-neutral-700/60"
                  }`}
                >
                  {isImage ? (
                    <img
                      src={item.message}
                      alt="첨부 이미지"
                      className="max-w-[200px] sm:max-w-[260px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
                      onClick={() => setSelectedImage(item.message)}
                    />
                  ) : (
                    item.message
                  )}

                  {/* ⚡️ 내가 작성한 메시지 호버 삭제 버튼 (PC용) */}
                  {isMyMessage && (
                    <button
                      onClick={() => setDeletingMessage(item)}
                      className="cursor-pointer absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-neutral-900/80 hover:bg-red-500/80 text-white rounded-full transition duration-150"
                      title="메시지 삭제"
                    >
                      <IoTrashOutline size={12} />
                    </button>
                  )}
                </div>

                <span
                  className={`text-xs text-neutral-500 mt-1 px-1 ${
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
          <>
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
                className="p-2 text-neutral-400 hover:text-white bg-neutral-700 hover:bg-emerald-400/90 cursor-pointer rounded-full transition"
                title="사진 첨부"
              >
                <IoImageOutline size={22} />
              </button>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  isUploading ? "전송 중..." : "메시지를 입력하세요..."
                }
                disabled={isUploading}
                rows={1}
                maxLength={500}
                className="flex-1 bg-neutral-900 text-white placeholder-neutral-500 text-sm rounded-2xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#bef408] max-h-24 scrollbar-none disabled:opacity-50"
              />

              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
                  canSend
                    ? "bg-[#bef408] text-neutral-900 hover:bg-[#bef408]/80 cursor-pointer"
                    : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                }`}
              >
                <IoSend size={16} />
              </button>
            </div>
          </>
        )}
      </footer>

      {/* ⚡️ 삭제 확인 모달 UI */}
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
                className="cursor-pointer flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white text-[15px] font-medium rounded-xl transition"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="cursor-pointer flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[15px] font-semibold rounded-xl transition"
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
