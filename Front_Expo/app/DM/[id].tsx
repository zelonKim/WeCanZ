import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { getSocket } from "@/lib/socket";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as NavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Socket } from "socket.io-client";
import {
  createReport,
  REPORT_REASON_LABELS,
  ReportReason,
} from "../(tabs)/setting";

interface MessageUser {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface DirectChatMessage {
  id: string;
  message: string;
  createdAt: string;
  imageUrl: string;
  roomId: string;
  senderId: string;
  sender?: MessageUser;
}

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function DirectChatRoomScreen() {
  const {
    id: roomId,
    name,
    profileImage,
  } = useLocalSearchParams<{
    id: string;
    name?: string;
    profileImage?: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

  // 신고 모달 상태 (ID 대신 닉네임 입력)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);

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

  const { data: roomInfo } = useQuery({
    queryKey: ["dm-room", roomId],
    queryFn: async () => {
      const { data } = await client.get(`direct-chat/rooms/${roomId}`);
      return data;
    },
    enabled: !!roomId,
  });

  const partnerImage = roomInfo?.partner?.profileImage;

  const partnerName = roomInfo?.partner?.nickname || "";

  const partnerId = roomInfo?.partner?.id || "";

  // 내 정보 조회
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await client.get("/user/me");
      return res.data?.data || res.data;
    },
  });

  // 초기 메시지 내역 조회 (REST API)
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

  // 메시지 목록 상태 관리
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // 1. 소켓 연결 및 이벤트 핸들링 (전역 소켓 재사용)
  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();

    // 연결 안 되어 있다면 커넥트
    if (!socket.connected) {
      socket.connect();
    }

    socketRef.current = socket;

    // 대화방 입장
    socket.emit("joinDirectRoom", { roomId, userId: myInfo?.id });

    // 2. 앱 상태(Foreground / Background) 변화 감지
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
      // 💡 [핵심] 연결을 끊는 disconnect()는 부르지 말고, 방 퇴장 이벤트와 리스너 해제만 진행합니다.
      socket.emit("leaveDirectRoom", { roomId, userId: myInfo?.id });
      socket.off("newDirectMessage", handleNewMessage);
      socket.off("directMessageDeleted", handleDeletedMessage);
      appStateSubscription.remove();
    };
  }, [roomId, myInfo?.id]);

  // 2. 네트워크 감지 및 재연결
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

  ///////////////////////////////////////////////////////////////////////////

  // 메시지 전송
  const handleSend = async () => {
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
      console.error("메시지 전송 또는 이미지 업로드 실패:", error);
      Alert.alert("오류", "메시지를 전송하지 못했습니다.");
    }
  };

  // 메시지 삭제
  const handleLongPressMessage = (msg: DirectChatMessage) => {
    if (myInfo?.id && msg.senderId !== myInfo.id) return;

    Alert.alert("메시지 삭제", "이 메시지를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
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

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 1. 차단된 유저 목록 조회 (API 엔드포인트 경로에 맞게 확인)
  const { data: blockedUsers = [] } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const res = await client.get("/friendship/blocked");
      return res.data?.data || res.data;
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  // 2. 메시지 목록 또는 params/props에서 상대방 User ID를 도출
  const targetUserId = useMemo(() => {
    const otherMsg = messages.find(
      (msg) => String(msg.senderId) !== String(myInfo?.id),
    );
    return otherMsg?.senderId || otherMsg?.sender?.id;
  }, [messages, myInfo]);

  // 3. 차단 목록의 receiver.id 중 targetUserId가 존재하는지 확인
  const isBlocked = useMemo(() => {
    if (!targetUserId || !blockedUsers.length) return false;

    return blockedUsers.some(
      (item: any) => String(item.receiver?.id) === String(targetUserId),
    );
  }, [targetUserId, blockedUsers]);

  const insets = useSafeAreaInsets();

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

  ////////////////////////////////////////////////////////

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      Alert.alert("신고 완료", "신고가 성공적으로 접수되었습니다.");
      setIsReportModalOpen(false);
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

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      Alert.alert("경고", "상세 신고 내용을 입력해주세요.");
      return;
    }
    setIsSubmittingReport(true);

    try {
      reportMutation.mutate({
        reportedUserId: partnerId,
        reason: selectedReason,
        details: reportDetails.trim(),
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "존재하지 않는 유저이거나 조회 실패했습니다.";
      Alert.alert("조회 실패", msg);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////

  // 친구 신청 보내기
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      return await client.post(`/friendship/request/${receiverId}`);
    },
    onSuccess: () => {
      Alert.alert("성공", "친구 요청을 보냈습니다.");
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "친구 신청에 실패했습니다.",
      );
    },
  });

  //  유저 차단하기
  const blockUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await client.patch(`/friendship/block/${targetUserId}`);
    },
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

  const handleCloseMenu = () => setIsMenuOpen(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "접근 권한 필요",
        "사진을 선택하려면 갤러리 접근 권한이 필요합니다.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  ////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {partnerImage ? (
              <Image
                source={{ uri: partnerImage }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.text} />
              </View>
            )}
          </TouchableOpacity>

          {isMenuOpen && (
            <View style={styles.inlineTabPopover}>
              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  router.push(`/profile/${partnerId}`);
                }}
              >
                <Text style={styles.popoverText}>프로필 보기</Text>
              </TouchableOpacity>

              <View style={styles.popoverDivider} />

              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  sendFriendRequestMutation.mutate(partnerId);
                }}
              >
                <Text style={styles.popoverText}>친구 요청</Text>
              </TouchableOpacity>

              <View style={styles.popoverDivider} />

              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  Alert.alert(
                    "유저 차단",
                    `${partnerName}님을 차단하시겠습니까?`,
                    [
                      { text: "취소", style: "cancel" },
                      {
                        text: "차단",
                        style: "destructive",
                        onPress: () =>
                          blockUserMutation.mutate(partnerId || ""),
                      },
                    ],
                  );
                }}
              >
                <Text style={[styles.popoverText, { color: "#FF5252" }]}>
                  차단
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.headerNickname} numberOfLines={1}>
            {partnerName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsReportModalOpen(true);
          }}
        >
          <Ionicons name="warning-outline" size={20} color="#FF453A" />
        </TouchableOpacity>

        <Modal
          visible={isReportModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsReportModalOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={"padding"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : -40}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>🚨 채팅 신고하기</Text>
                  <TouchableOpacity onPress={() => setIsReportModalOpen(false)}>
                    <Ionicons name="close" size={22} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>유저 닉네임</Text>
                  <TextInput
                    style={styles.ReportInput}
                    value={partnerName}
                    editable={false}
                    placeholder="상대방 닉네임을 입력해주세요"
                    placeholderTextColor={Colors.tabIconDefault}
                  />

                  <Text style={styles.inputLabel}>신고 사유 선택</Text>
                  <View style={styles.chipContainer}>
                    {Object.values(ReportReason).map((reason) => {
                      const isSelected = selectedReason === reason;
                      return (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                          onPress={() => setSelectedReason(reason)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {REPORT_REASON_LABELS[reason]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.inputLabel}>상세 내용</Text>
                  <TextInput
                    style={[styles.ReportInput, styles.textArea]}
                    value={reportDetails}
                    onChangeText={setReportDetails}
                    placeholder="신고 사유에 대한 상세 내용을 적어주세요."
                    placeholderTextColor={Colors.tabIconDefault}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: Colors.red }]}
                  onPress={handleSubmitReport}
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>
                      신고 접수하기
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -50}
      >
        {isLoading ? (
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
            renderItem={({ item }) => {
              const isMyMessage =
                (item.senderId && item.senderId === myInfo?.id) ||
                (item.sender?.id && item.sender.id === myInfo?.id);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onLongPress={() => handleLongPressMessage(item)}
                  style={[
                    styles.messageWrapper,
                    isMyMessage ? styles.myWrapper : styles.otherWrapper,
                  ]}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-end" }}
                  >
                    {isMyMessage && (
                      <Text style={styles.timeText}>
                        {formatTime(item.createdAt)}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isMyMessage ? styles.myBubble : styles.otherBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMyMessage ? styles.myText : styles.otherText,
                        ]}
                      >
                        {item.message}
                      </Text>
                    </View>
                    {!isMyMessage && (
                      <Text style={styles.timeText}>
                        {formatTime(item.createdAt)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom:
                Platform.OS === "ios"
                  ? Math.max(insets.bottom, 32)
                  : Math.max(insets.bottom + 12, 60),
            },
          ]}
        >
          {isBlocked ? (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedText}>
                차단한 유저와는 대화할 수 없습니다.
              </Text>
            </View>
          ) : (
            <View>
              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRowContainer}>
                <TouchableOpacity
                  onPress={handleImagePick}
                  style={styles.imageButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={22} color="#a3a3a3" />
                </TouchableOpacity>

                <View style={[styles.inputCapsule]}>
                  <TextInput
                    style={styles.input}
                    placeholder="메시지를 입력하세요..."
                    placeholderTextColor="#8E8E93"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !inputText.trim() &&
                        !selectedImage &&
                        styles.disabledSendButton,
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() && !selectedImage}
                  >
                    <Ionicons name="arrow-up" size={20} color={Colors.card} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  headerButton: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    flex: 1,
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
    width: 80,
    height: 1,
    marginVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // 💡 프로필 이미지 바로 옆에 뜰 인라인 팝업 탭 스타일
  inlineTabPopover: {
    position: "absolute",
    left: 38, // 아바타 너비(40) + 여백
    top: 5,
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
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 4 : 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputRowContainer: {
    flexDirection: "row", // 가로로 나란히 배치
    alignItems: "center", // 세로 기준 가운데 정렬
    gap: 8, // 버튼과 인풋 캡슐 사이의 간격 (RN 0.71+ 지원, 구버전은 marginRight 사용)
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
});
