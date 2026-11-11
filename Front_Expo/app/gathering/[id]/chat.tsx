import { client } from "@/api/client";
import { requestDM } from "@/api/DM/requestDM";
import { blockFriend } from "@/api/friend/blcokFriend";
import { requestFriendship } from "@/api/friend/requestFriendship";
import { getGatheringDetail } from "@/api/gathering/getGatheringDetail";
import { createReport } from "@/api/user/createReport";
import { getMyInfo } from "@/api/user/getMyInfo";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInputBar } from "@/components/ChatInputBar";
import { GatheringChatMenuPopover } from "@/components/GatheringChatMenuPopover";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { ReportModal } from "@/components/ReportModal";
import Colors from "@/constants/Colors";
import { useGatheringChatLanguage } from "@/hooks/Languages/useGatheringChatLanguage";
import { getSocket } from "@/lib/socket";
import { ChatMessage } from "@/types/gathering/ChatMessage";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { Participant } from "@/types/user/Participant";
import { ReportReason } from "@/types/user/ReportReason";
import { formatTime } from "@/utils/formatTime";
import { handleImagePick } from "@/utils/handleImagePick";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

export default function GatheringChatScreen() {
  const { t, currentLang } = useGatheringChatLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  ////////////////////////////////////////////////////////////////////////////////////////////

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleCloseMenu = () => setActiveMenuMessageId(null);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: gathering } = useQuery({
    queryKey: ["gathering", id],
    queryFn: () => getGatheringDetail(id),
    enabled: !!id,
  });

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: serverMessages = [], isLoading } = useQuery<ChatMessage[]>({
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

  ////////////////////////////////////////////////////////////////////////////////////////////

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

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        joinRoom();
      } else if (nextAppState === "background") {
        socket.emit("leaveGatheringRoom", { gatheringId: id, userId: me.id });
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!socket.connected) {
          socket.connect();
        }
        joinRoom();
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    });

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
      appStateSubscription.remove();
      unsubscribeNetInfo();
    };
  }, [id, me?.id, queryClient]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!id) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const socket = socketRef.current;
      if (state.isConnected && socket && !socket.connected) {
        socket.connect();
        socket.emit("joinGatheringRoom", { gatheringId: id, userId: me?.id });
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [id, me?.id, queryClient]);

  ///////////////////////////////////////////////////////////////////////////

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
      Alert.alert("오류", "메시지를 전송하지 못했습니다.");
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleDeleteMessage = (msg: ChatMessage) => {
    const isMyMessage = String(msg.userId) === String(me?.id);

    if (!isHost && !isMyMessage) {
      return Alert.alert(
        "권한 없음",
        "본인이 작성한 메시지만 삭제할 수 있습니다.",
      );
    }

    Alert.alert("메시지 삭제", "이 메시지를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          if (!socketRef.current || !me?.id) return;

          socketRef.current.emit("deleteGatheringMessage", {
            gatheringId: id,
            messageId: msg.id,
            userId: me.id,
          });
        },
      },
    ]);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: createReportMutation } = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      Alert.alert("신고 완료", "신고가 성공적으로 접수되었습니다.");
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "신고 접수 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    },
    onSettled: () => {
      setIsSubmittingReport(false);
    },
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      Alert.alert("경고", "신고할 유저의 닉네임을 입력해주세요.");
      return;
    }
    if (!reportDetails.trim()) {
      Alert.alert("경고", "상세 신고 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReport(true);

    try {
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        Alert.alert("오류", "해당 닉네임을 가진 유저를 찾을 수 없습니다.");
        setIsSubmittingReport(false);
        return;
      }

      const createReportPayload: CreateReportDto = {
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutation(createReportPayload);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "존재하지 않는 유저이거나 조회 실패했습니다.";
      Alert.alert("조회 실패", msg);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////

  const { mutate: sendFriendRequestMutation } = useMutation({
    mutationFn: requestFriendship,
    onSuccess: () => {
      Alert.alert("성공", "친구 요청을 보냈습니다.");
    },
    onError: (err: any) => {
      const message = err.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;

      Alert.alert("오류", displayMessage || "친구 신청에 실패했습니다.");
    },
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: requestDmMutation } = useMutation({
    mutationFn: requestDM,
    onSuccess: () => {
      Alert.alert("성공", "DM 요청을 보냈습니다.");
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "DM 요청에 실패했습니다.",
      );
    },
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: blockUserMutation } = useMutation({
    mutationFn: blockFriend,
    onSuccess: () => {
      Alert.alert("성공", "해당 유저를 차단했습니다.");
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "유저 차단에 실패했습니다.",
      );
    },
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -50}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.green} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.chatScroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {visibleMessages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={32}
                    color="white"
                  />
                </View>
                <Text style={styles.emptyTitle}>{t.emptyTitle}</Text>
                <Text style={styles.emptySubText}>{t.emptySubText}</Text>
              </View>
            ) : (
              visibleMessages.map((msg) => {
                const isMyMessage = String(msg.userId) === String(me?.id);
                const formattedTime = formatTime(msg.createdAt, currentLang);

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageWrapper,
                      isMyMessage
                        ? styles.myMessageWrapper
                        : styles.otherMessageWrapper,
                    ]}
                  >
                    {!isMyMessage && (
                      <View style={styles.senderContainer}>
                        <TouchableOpacity
                          activeOpacity={me?.id ? 1 : 0.5}
                          onPress={() => {
                            if (msg.user && msg.user.id !== me?.id) {
                              setActiveMenuMessageId(
                                activeMenuMessageId === msg.id ? null : msg.id,
                              );
                            }
                          }}
                        >
                          {msg.user?.profileImage ? (
                            <Image
                              source={{ uri: msg.user.profileImage }}
                              style={styles.profileImage}
                            />
                          ) : (
                            <View style={styles.avatarPlaceholder}>
                              <Ionicons
                                name="person"
                                size={14}
                                color="#8E8E93"
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                        <Text style={styles.senderName}>
                          {msg.user?.nickname || ""}
                        </Text>
                      </View>
                    )}

                    {activeMenuMessageId === msg.id && msg.user && (
                      <GatheringChatMenuPopover
                        msg={msg}
                        onClose={handleCloseMenu}
                        onViewProfile={(userId) =>
                          router.push(`/profile/${userId}`)
                        }
                        onSendFriendRequest={(userId) =>
                          sendFriendRequestMutation(userId)
                        }
                        onRequestDm={(userId) => requestDmMutation(userId)}
                        onBlockUser={(userId) => blockUserMutation(userId)}
                        styles={styles}
                      />
                    )}

                    <View style={styles.bubbleRow}>
                      {isMyMessage && (
                        <Text style={styles.myTimestamp}>{formattedTime}</Text>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => handleDeleteMessage(msg)}
                        style={[
                          styles.messageContainer,
                          isMyMessage
                            ? styles.myMessageContainer
                            : styles.otherMessageContainer,
                        ]}
                      >
                        {msg.imageUrl && (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setModalImageUri(msg.imageUrl || "")}
                          >
                            <Image
                              source={{ uri: msg.imageUrl }}
                              style={
                                !msg.message
                                  ? styles.onlyImage
                                  : styles.chatImage
                              }
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        )}

                        {msg.message ? (
                          <View
                            style={[
                              styles.bubble,
                              isMyMessage
                                ? styles.myBubble
                                : styles.otherBubble,
                            ]}
                          >
                            <Text
                              style={[
                                styles.messageText,
                                isMyMessage
                                  ? styles.myMessageText
                                  : styles.otherMessageText,
                              ]}
                            >
                              {msg.message}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>

                      {!isMyMessage && (
                        <Text style={styles.otherTimestamp}>
                          {formattedTime}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        <ChatInputBar
          selectedImage={selectedImage}
          onRemoveImage={() => setSelectedImage(null)}
          onImagePick={() => handleImagePick(setSelectedImage)}
          inputText={messageText}
          onChangeText={setMessageText}
          onSend={handleSendMessage}
          insetsBottom={insets.bottom}
        />
      </KeyboardAvoidingView>

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
        styles={styles}
      />
    </View>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  navIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleCenter: {
    alignItems: "center",
    maxWidth: "65%",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  headerSubTitle: {
    fontSize: 11,
    color: "#71717A",
    marginTop: 2,
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 200,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubText: {
    color: "#71717A",
    fontSize: 13,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  senderName: {
    fontSize: 12,
    color: "#A1A1AA",
    fontWeight: "600",
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 6,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: "100%",
  },
  myBubble: {
    backgroundColor: Colors.green,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    textAlign: "right",
  },
  myMessageText: {
    color: "#000000",
    fontWeight: "500",
  },
  otherMessageText: {
    color: "#F4F4F5",
    fontWeight: "400",
  },
  myTimestamp: {
    fontSize: 10,
    color: "#52525B",
    marginBottom: 2,
  },
  otherTimestamp: {
    fontSize: 10,
    color: "#52525B",
    marginBottom: 2,
  },

  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },

  inputRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  inputCapsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 4 : 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxHeight: 90,
    fontWeight: "500",
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalBody: { gap: 12, marginBottom: 20 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: Platform.OS === "ios" ? 0 : 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: -8,
    textAlign: "center",
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#000000", fontSize: 16, fontWeight: "700" },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderColor: Colors.red,
  },
  chipText: {
    fontSize: 13,
    color: Colors.tabIconDefault,
  },
  chipTextSelected: {
    color: Colors.red,
    fontWeight: "600",
  },

  inputLabel: { fontSize: 12, fontWeight: "600", color: Colors.tabIconDefault },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { height: 70, textAlignVertical: "top" },
  popoverItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popoverText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  popoverDivider: {
    width: 80,
    height: 1,
    marginVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // 💡 프로필 이미지 바로 옆에 뜰 인라인 팝업 탭 스타일
  inlineTabPopover: {
    position: "absolute",
    left: 38, // 아바타 너비(40) + 여백
    top: 0,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2C2C2E", // 모던한 다크 팝업/카드 배경색 (앱 테마에 맞게 조정)
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
  },
  button: {
    padding: 8, // p-2 (Tailwind p-2는 보통 8px)
    backgroundColor: "rgba(82, 82, 82, 0.6)", // bg-neutral-600/60
    borderRadius: 9999, // rounded-full
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5, // 비활성화 시 투명도 조절
  },
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    left: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  onlyImage: {
    width: 160, // 적절한 고정 너비 또는 max 성격의 크기
    height: 160, // 적절한 높이
    borderRadius: 8,
  },

  chatImage: {
    width: 160, // 적절한 고정 너비 또는 max 성격의 크기
    height: 160, // 적절한 높이
    borderRadius: 8,
    marginBottom: 12, // 텍스트가 아래에 있을 경우 간격 확보
  },
  // 부모 컨테이너 (내부 요소들이 서로 영향을 주지 않고 정렬되도록 설정)
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 4,
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end", // 내 메시지는 우측 정렬
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start", // 상대방 메시지는 좌측 정렬
  },
  // 모달 전체 배경 (반투명 검은색)
  imageModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // 모달 내부 콘텐츠 박스
  imageModalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  // 확대되어 보이는 이미지 스타일
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
