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
import Colors from "@/constants/Colors";
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
import NetInfo from "@react-native-community/netinfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

export default function DirectChatRoomScreen() {
  const { t } = useDmRoomLanguage();

  const { id: roomId } = useLocalSearchParams<{
    id: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (Platform.OS === "android") {
      const setupAndroidNavigationBar = async () => {
        await NavigationBar.setBackgroundColorAsync("#121212");
        await NavigationBar.setButtonStyleAsync("light");
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setVisibilityAsync("visible");
      };

      setupAndroidNavigationBar();
    }
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;

    socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });
      } else if (nextAppState === "background") {
        socket.emit("leaveDirectRoom", { roomId, userId: myInfo?.id });
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

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
      appStateSubscription.remove();
    };
  }, [roomId, myInfo?.id]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const socket = socketRef.current;
      if (state.isConnected && socket && !socket.connected) {
        socket.connect();
        socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });
        queryClient.invalidateQueries({ queryKey: ["dm-messages", roomId] });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [roomId, queryClient]);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { data: roomInfo } = useQuery<DMRoomInfoResponse>({
    queryKey: ["dm-room", roomId],
    queryFn: () => getRoomInfo(roomId),
    enabled: !!roomId,
  });

  const partnerId = roomInfo?.partner?.id || "";
  const partnerName = roomInfo?.partner?.nickname || "";
  const partnerImage = roomInfo?.partner?.profileImage;

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      Alert.alert(t.alerts.warning, t.alerts.reportEmptyDetails);
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
      Alert.alert(t.alerts.reportUserNotFoundTitle, msg);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

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
      Alert.alert(t.alerts.error, t.alerts.sendMessageFail);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleDeleteMessage = (msg: DirectChatMessage) => {
    if (myInfo?.id && msg.senderId !== myInfo.id) return;

    Alert.alert(t.alerts.deleteMessageTitle, t.alerts.deleteMessageConfirm, [
      { text: t.alerts.cancel, style: "cancel" },
      {
        text: t.alerts.delete,
        style: "destructive",
        onPress: () => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
          socketRef.current?.emit("deleteDirectMessage", {
            roomId,
            messageId: msg.id,
            userId: myInfo?.id,
          });
        },
      },
    ]);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: sendFriendRequestMutate } = useSendFriendRequestMutation();

  const { mutate: blockUserMutate } = useBlockUserMutation();

  ////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <ChatHeader
        onBack={() => router.back()}
        title={partnerName}
        avatarUri={partnerImage}
        onAvatarPress={() => setIsMenuOpen(!isMenuOpen)}
        onReportPress={() => setIsReportModalOpen(true)}
      >
        {isMenuOpen && (
          <DmMenuPopover
            partnerId={partnerId}
            partnerName={partnerName}
            onClose={() => setIsMenuOpen(false)}
            onNavigateProfile={(id) => router.push(`/profile/${id}`)}
            onSendFriendRequest={sendFriendRequestMutate}
            onBlockUser={blockUserMutate}
            styles={styles}
          />
        )}
      </ChatHeader>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -50}
      >
        {initMessagePending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.green} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => (
              <DirectChatMessageItem
                item={item}
                myInfo={myInfo}
                onDeleteMessage={handleDeleteMessage}
                onOpenImageModal={(uri) => setModalImageUri(uri)}
                styles={styles}
              />
            )}
          />
        )}

        <ChatInputBar
          isBlocked={isBlocked}
          selectedImage={selectedImage}
          onRemoveImage={() => setSelectedImage(null)}
          onImagePick={() => handleImagePick(setSelectedImage)}
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          insetsBottom={insets.bottom}
        />
      </KeyboardAvoidingView>

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

      <ImageViewerModal
        imageUri={modalImageUri}
        onClose={() => setModalImageUri(null)}
        styles={styles}
      />
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  headerButtonLeft: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerButtonRight: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerNickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: "75%",
  },
  myWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: Colors.green,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: Colors.card,
    fontWeight: "500",
  },
  otherText: {
    color: "#F2F2F7",
  },
  timeText: {
    fontSize: 9,
    color: "#4c4c4c",
    marginTop: 3,
    marginHorizontal: 4,
  },
  inputContainer: {
    paddingTop: 12,
    paddingHorizontal: Platform.OS === "ios" ? 20 : 15,
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: "#FFFFFF",
  },
  ReportInput: {
    backgroundColor: "#2C2C2E",
    color: Colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: "#3A3A3C",
  },
  blockedBanner: {
    height: 40,
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  blockedText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
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
    width: 110,
    height: 1,
    marginVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  inlineTabPopover: {
    position: "absolute",
    left: 32,
    top: 12,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
    width: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
    marginBottom: Platform.OS === "android" ? 32 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  modalBody: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  subInputLabel: {
    fontSize: 12,
    color: Colors.tabIconDefault,
    marginTop: 8,
    marginBottom: 4,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  categorySelectRow: { flexDirection: "row", gap: 8 },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCategoryChipActive: { backgroundColor: Colors.green },
  modalCategoryText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  modalCategoryTextActive: { color: Colors.card },
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
  saveButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#000000", fontSize: 16, fontWeight: "700" },
  inputCapsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    paddingHorizontal: 3,
    paddingVertical: Platform.OS === "ios" ? 4 : 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  chatImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 6,
  },
  onlyImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  messageContainer: {
    maxWidth: "75%",
  },
  imageModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
