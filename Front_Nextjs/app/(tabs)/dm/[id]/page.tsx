"use client";

import { getDmMessages } from "@/api/DM/getDmMessages";
import { getRoomInfo } from "@/api/DM/getDMRoomInfo";
import { getBlockedUsers } from "@/api/user/getBlockedUsers";
import { getMyInfo } from "@/api/user/getMyInfo";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInputBar } from "@/components/ChatInputBar";
import { DirectChatMessageItem } from "@/components/DirectChatMessageItem";
import { DmMenuPopover } from "@/components/DmMenuPopover";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { ReportModal } from "@/components/ReportModal";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useSendFriendRequestMutation } from "@/hooks/friend/useSendFriendRequestMutation";
import { useDmRoomLanguage } from "@/hooks/Languages/useDmRoomLanguage";
import { useCreateReportMutation } from "@/hooks/user/useCreateReportMutation";
import { getSocket } from "@/lib/socket";
import { DirectChatMessage } from "@/types/DM/DirectChatMessage";
import { DMRoomInfoResponse } from "@/types/DM/DMRoomInfoResponse";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { ReportReason } from "@/types/user/ReportReason";
import { handleImagePick } from "@/utils/handleImagePick";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Socket as SocketIoClient } from "socket.io-client";

export default function DirectChatRoomPage() {
  const { t } = useDmRoomLanguage();

  const params = useParams();
  const roomId = params?.id as string;

  const router = useRouter();
  const queryClient = useQueryClient();

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<SocketIoClient | null>(null);

  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const avatarRef = useRef<HTMLButtonElement>(null);

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

  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  // 소켓 연결 및 이벤트 설정
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;

    socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });
      } else {
        socket.emit("leaveDirectRoom", { roomId, userId: myInfo?.id });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

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
      socket.emit("leaveDirectRoom", { roomId, userId: myInfo?.id });
      socket.off("newDirectMessage", handleNewMessage);
      socket.off("directMessageDeleted", handleDeletedMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId, myInfo?.id]);

  const { data: roomInfo } = useQuery<DMRoomInfoResponse>({
    queryKey: ["dm-room", roomId],
    queryFn: () => getRoomInfo(roomId),
    enabled: !!roomId,
  });

  const partnerId = roomInfo?.partner?.id || "";
  const partnerName = roomInfo?.partner?.nickname || "";
  const partnerImage = roomInfo?.partner?.profileImage;

  const { data: initialMessages = [], isPending: initMessagePending } =
    useQuery<DirectChatMessage[]>({
      queryKey: ["dm-messages", roomId],
      queryFn: () => getDmMessages(roomId),
      enabled: !!roomId,
    });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: getBlockedUsers,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const isBlocked = useMemo(() => {
    if (!partnerId || !blockedUsers || blockedUsers.length === 0) return false;

    return blockedUsers.some((item: any) => {
      return (
        String(item.senderId) === String(partnerId) ||
        String(item.receiverId) === String(partnerId) ||
        String(item.receiver?.id) === String(partnerId)
      );
    });
  }, [partnerId, blockedUsers]);

  const { mutate: createReportMutate } = useCreateReportMutation(
    () => {
      setIsReportModalOpen(false);
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    () => {
      setIsSubmittingReport(false);
    },
  );

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      alert(`${t.alerts.warning}: ${t.alerts.reportEmptyDetails}`);
      return;
    }
    setIsSubmittingReport(true);

    try {
      const createReportPayload: CreateReportDto = {
        reportedUserId: partnerId,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutate(createReportPayload);
    } catch (error: any) {
      const msg = error.response?.data?.message || t.alerts.reportUserNotFound;
      alert(`${t.alerts.reportUserNotFoundTitle}: ${msg}`);
      setIsSubmittingReport(false);
    }
  };

  const handleSendMessage = async () => {
    const messageText = inputText.trim();

    if (
      (!messageText && !selectedImage) ||
      !myInfo?.id ||
      !roomId ||
      !socketRef.current
    ) {
      return;
    }

    setInputText("");
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

      const tempMessage: DirectChatMessage = {
        id: `temp-${Date.now()}`,
        message: messageText,
        imageUrl: imageUrl,
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
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error(error);
      alert(`${t.alerts.error}: ${t.alerts.sendMessageFail}`);
    }
  };

  const handleDeleteMessage = (msg: DirectChatMessage) => {
    if (myInfo?.id && msg.senderId !== myInfo.id) return;

    if (
      window.confirm(
        `${t.alerts.deleteMessageTitle}\n\n${t.alerts.deleteMessageConfirm}`,
      )
    ) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      socketRef.current?.emit("deleteDirectMessage", {
        roomId,
        messageId: msg.id,
        userId: myInfo?.id,
      });
    }
  };

  const { mutate: sendFriendRequestMutate } = useSendFriendRequestMutation();
  const { mutate: blockUserMutate } = useBlockUserMutation();

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* 상단 채팅 헤더 */}
      <ChatHeader
        onBack={() => router.back()}
        title={partnerName}
        avatarUri={partnerImage}
        avatarRef={avatarRef}
        onAvatarPress={() => setIsMenuOpen(!isMenuOpen)}
        onReportPress={() => setIsReportModalOpen(true)}
      />
      {isMenuOpen && (
        <DmMenuPopover
          partnerId={partnerId}
          partnerName={partnerName}
          avatarRef={avatarRef}
          onClose={() => setIsMenuOpen(false)}
          onNavigateProfile={(id: string) => router.push(`/profile/${id}`)}
          onSendFriendRequest={sendFriendRequestMutate}
          onBlockUser={blockUserMutate}
        />
      )}

      {/* 메시지 리스트 영역 */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {initMessagePending ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#bef408]" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
          >
            {messages.map((item) => (
              <DirectChatMessageItem
                key={item.id}
                item={item}
                myInfo={myInfo}
                onDeleteMessage={handleDeleteMessage}
                onOpenImageModal={(uri) => setModalImageUri(uri)}
              />
            ))}
          </div>
        )}

        {/* 하단 입력창 바 */}
        <ChatInputBar
          isBlocked={isBlocked}
          selectedImage={selectedImage}
          onRemoveImage={() => setSelectedImage(null)}
          onImagePick={() => handleImagePick(setSelectedImage)}
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
        />
      </div>

      {/* 신고 모달 */}
      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetNickname={partnerName}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        reportDetails={reportDetails}
        onChangeReportDetails={setReportDetails}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
        isEditable={false}
      />

      {/* 이미지 뷰어 모달 */}
      <ImageViewerModal
        imageUri={modalImageUri}
        onClose={() => setModalImageUri(null)}
      />
    </div>
  );
}
