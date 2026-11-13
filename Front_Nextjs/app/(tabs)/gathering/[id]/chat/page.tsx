"use client";

import { client } from "@/api/client";
import { getGatheringDetail } from "@/api/gathering/getGatheringDetail";
import { getMyInfo } from "@/api/user/getMyInfo";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInputBar } from "@/components/ChatInputBar";
import { GatheringChatMenuPopover } from "@/components/GatheringChatMenuPopover";
import { GatheringChatMessageItem } from "@/components/GatheringChatMessageItem";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { ReportModal } from "@/components/ReportModal";
import { useRequestDmMutation } from "@/hooks/DM/useRequestDmMutation";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useSendFriendRequestMutation } from "@/hooks/friend/useSendFriendRequestMutation";
import { useGatheringChatLanguage } from "@/hooks/Languages/useGatheringChatLanguage";
import { useCreateReportMutation } from "@/hooks/user/useCreateReportMutation";
import { getSocket } from "@/lib/socket";
import { ChatMessage } from "@/types/gathering/ChatMessage";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { Participant } from "@/types/user/Participant";
import { ReportReason } from "@/types/user/ReportReason";
import { handleImagePick } from "@/utils/handleImagePick";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Socket as SocketIoClient } from "socket.io-client";

export default function GatheringChatPage() {
  const { t, currentLang } = useGatheringChatLanguage();

  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const socketRef = useRef<SocketIoClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleCloseMenu = () => setActiveMenuMessageId(null);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  const { data: gathering } = useQuery({
    queryKey: ["gathering", id],
    queryFn: () => getGatheringDetail(id),
    enabled: !!id,
  });

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );

  const { data: serverMessages = [], isPending } = useQuery<ChatMessage[]>({
    queryKey: ["gathering-messages", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering-chat/${id}/messages`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (serverMessages.length > 0) {
      setMessages(serverMessages);
    }
  }, [serverMessages]);

  useEffect(() => {
    if (!id || !me?.id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;

    const joinRoom = () => {
      if (socket.connected) {
        socket.emit("joinGatheringRoom", { gatheringId: id, userId: me.id });
      }
    };

    joinRoom();

    socket.on("connect", joinRoom);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        joinRoom();
      } else {
        socket.emit("leaveGatheringRoom", { gatheringId: id, userId: me.id });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

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
      socket.emit("leaveGatheringRoom", { gatheringId: id, userId: me.id });
      socket.off("connect", joinRoom);
      socket.off("newGatheringMessage", handleNewMessage);
      socket.off("gatheringMessageDeleted", handleDeletedMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, me?.id, queryClient]);

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if ((!text && !selectedImage) || !socketRef.current || !me?.id || !id)
      return;

    setMessageText("");
    const imageToUpload = selectedImage;
    setSelectedImage(null);

    let imageUrl = null;

    try {
      if (imageToUpload) {
        const uploadData = await uploadProfileImage(imageToUpload);
        if (uploadData?.imageUrl) {
          imageUrl = uploadData.imageUrl;
        }
      }

      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: text,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        gatheringId: id,
        userId: me.id,
        user: {
          id: me.id,
          nickname: me.nickname ?? "",
          profileImage: me.profileImage ?? null,
        },
      };

      setMessages((prev) => [...prev, tempMessage]);

      socketRef.current.emit("sendGatheringMessage", {
        gatheringId: id,
        userId: me.id,
        message: text,
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("메시지 전송 또는 이미지 업로드 실패:", error);
      alert(`${t.alerts.error}: ${t.alerts.sendFailMessage}`);
    }
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    const isMyMessage = String(msg.userId) === String(me?.id);

    if (!isHost && !isMyMessage) {
      return alert(
        `${t.alerts.unauthorizedTitle}\n${t.alerts.unauthorizedMessage}`,
      );
    }

    if (
      window.confirm(`${t.alerts.deleteTitle}\n\n${t.alerts.deleteMessage}`)
    ) {
      if (!socketRef.current || !me?.id) return;

      socketRef.current.emit("deleteGatheringMessage", {
        gatheringId: id,
        messageId: msg.id,
        userId: me.id,
      });
    }
  };

  const { mutate: createReportMutate } = useCreateReportMutation(
    () => {
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    () => {
      setIsSubmittingReport(false);
    },
  );

  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      alert(`${t.alerts.warning}: ${t.alerts.emptyTargetNickname}`);
      return;
    }
    if (!reportDetails.trim()) {
      alert(`${t.alerts.warning}: ${t.alerts.emptyReportDetails}`);
      return;
    }

    setIsSubmittingReport(true);

    try {
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        alert(`${t.alerts.error}: ${t.alerts.userNotFound}`);
        setIsSubmittingReport(false);
        return;
      }

      const createReportPayload: CreateReportDto = {
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutate(createReportPayload);
    } catch (error: any) {
      const msg = error.response?.data?.message || t.alerts.defaultLookupFail;
      alert(`${t.alerts.lookupFailTitle}: ${msg}`);
      setIsSubmittingReport(false);
    }
  };

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const res = await client.get("/friendship/blocked");
      return res.data?.data || res.data;
    },
  });

  const blockedUserIds = useMemo(() => {
    if (!Array.isArray(blockedUsers)) return [];
    return blockedUsers.map((b) => String(b.receiverId || b.receiver?.id));
  }, [blockedUsers]);

  const visibleMessages = useMemo(() => {
    return messages.filter(
      (msg) => !blockedUserIds.includes(String(msg.userId || msg.user?.id)),
    );
  }, [messages, blockedUserIds]);

  const { mutate: blockUserMutate } = useBlockUserMutation();
  const { mutate: sendFriendRequestMutate } = useSendFriendRequestMutation();
  const { mutate: requestDmMutate } = useRequestDmMutation();

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* 채팅 헤더 */}
      <ChatHeader
        onBack={() => router.push(`/gathering/${id}`)}
        title={gathering ? gathering.title : t.defaultTitle}
        subtitle={
          gathering
            ? `${t.participantPrefix}${
                gathering.participants?.filter(
                  (p: Participant) =>
                    p.status === "APPROVED" || p.status === "YES_SHOW",
                ).length || 0
              }${t.participantSuffix}`
            : undefined
        }
        onReportPress={() => setIsReportModalOpen(true)}
      />

      {/* 메시지 리스트 영역 */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {isPending ? (
          <div className="flex-1 flex justify-center items-center py-24">
            <div className="animate-spin text-4xl">
              <Image
                src="/logo/sticker.png"
                alt="WeCanZ_sticker"
                width={80}
                height={80}
              />
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
          >
            {visibleMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 mt-20">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {t.emptyTitle}
                </h2>
                <p className="text-xs text-zinc-500">{t.emptySubText}</p>
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <GatheringChatMessageItem
                  key={msg.id}
                  msg={msg}
                  me={me}
                  currentLang={currentLang}
                  activeMenuMessageId={activeMenuMessageId}
                  onToggleMenu={(msgId) =>
                    setActiveMenuMessageId(
                      activeMenuMessageId === msgId ? null : msgId,
                    )
                  }
                  onDeleteMessage={handleDeleteMessage}
                  onOpenImageModal={(uri) => setModalImageUri(uri)}
                  renderMenuPopover={(item) => (
                    <GatheringChatMenuPopover
                      msg={item}
                      onClose={handleCloseMenu}
                      onViewProfile={(userId) =>
                        router.push(`/profile/${userId}`)
                      }
                      onSendFriendRequest={(userId) =>
                        sendFriendRequestMutate(userId)
                      }
                      onRequestDm={(userId) => requestDmMutate(userId)}
                      onBlockUser={(userId) => blockUserMutate(userId)}
                    />
                  )}
                />
              ))
            )}
          </div>
        )}

        <ChatInputBar
          selectedImage={selectedImage}
          onRemoveImage={() => setSelectedImage(null)}
          onImagePick={() => handleImagePick(setSelectedImage)}
          inputText={messageText}
          onChangeText={setMessageText}
          onSend={handleSendMessage}
        />
      </div>

      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetNickname={targetNickname}
        onChangeTargetNickname={setTargetNickname}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        reportDetails={reportDetails}
        onChangeReportDetails={setReportDetails}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />

      <ImageViewerModal
        imageUri={modalImageUri}
        onClose={() => setModalImageUri(null)}
      />
    </div>
  );
}
