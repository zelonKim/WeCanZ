import { client } from "@/api/client";
import {
  createReport,
  REPORT_REASON_LABELS,
  ReportReason,
} from "@/app/(tabs)/setting";
import Colors from "@/constants/Colors";
import { getSocket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"; // 💡 탭바 높이 가져오기
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";
import { Participant } from ".";

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

export default function GatheringChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<Socket | null>(null);

  const appState = useRef(AppState.currentState);

  const insets = useSafeAreaInsets();

  // 💡 탭바 높이 동적 구하기 (탭 스크린이 아니면 0으로 예외 처리)
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = 0;
  }

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 신고 모달 상태 (ID 대신 닉네임 입력)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [activeMenuUserId, setActiveMenuUserId] = React.useState<string | null>(
    null,
  );

  // 💡 상단 useState 변경
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null,
  );

  // 메뉴 닫기 함수
  const handleCloseMenu = () => setActiveMenuMessageId(null);

  const searchUserByNickname = async (nickname: string) => {
    const { data } = await client.get(
      `/user/search/${encodeURIComponent(nickname)}`,
    );
    return data;
  };

  const reportMutation = useMutation({
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
      // 1. 닉네임으로 유저 정보 조회
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        Alert.alert("오류", "해당 닉네임을 가진 유저를 찾을 수 없습니다.");
        setIsSubmittingReport(false);
        return;
      }

      // 2. 조회된 유저 ID로 신고 API 호출
      reportMutation.mutate({
        reportedUserId: searchedUser.id,
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

  // 1. 내 정보 및 모임 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const { data: gathering } = useQuery({
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

  ////////////////////////////////

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

  ////////////////////////////////
  // 2. 메시지 목록 조회
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

    // 소켓 최초 진입 및 재연결(connect) 발생 시 자동 방 재입장
    joinRoom();

    socket.on("connect", joinRoom);

    // 2. 앱 상태(Foreground / Background) 변화 감지
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // 앱으로 다시 돌아왔을 때 -> 백엔드 Map에 재등록
        joinRoom();
      } else if (nextAppState === "background") {
        // 화면이 꺼지거나 홈 화면으로 나갔을 때 -> 백엔드 Map에서 제거 (푸시 수신 가능 상태로 변경)
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
        joinRoom(); // 네트워크 복구 시 방 재입장
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    });

    // 메시지 핸들러
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
      appStateSubscription.remove(); // AppState 리스너 해제
      unsubscribeNetInfo();
    };
  }, [id, me?.id, queryClient]);

  // 네트워크 감지
  useEffect(() => {
    if (!id) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const socket = socketRef.current;
      if (state.isConnected && socket && !socket.connected) {
        socket.connect();
        socket.emit("joinGatheringRoom", { gatheringId: id, userId: me.id });
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, me?.id, queryClient]);

  ///////////////////////////////////////////////////////////////////////////

  // 메시지 전송
  const handleSend = () => {
    const text = messageText.trim();

    // 1. 유효성 검사
    if (!text || !socketRef.current || !me?.id || !id) return;

    // 2. 입력창 즉시 비우기 (사용자 입력 반응성 최적화)
    setMessageText("");

    // 3. UI에 즉시 보여줄 낙관적 임시 메시지 생성
    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: text,
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

    // 5. 소켓으로 서버에 메시지 발송
    socketRef.current.emit("sendGatheringMessage", {
      gatheringId: id,
      userId: me.id,
      message: text,
    });
  };

  // 메시지 삭제
  const handleDeletePrompt = (msg: ChatMessage) => {
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

  ////////////////////////////////////////////////////////

  // 친구 신청 보내기
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      return await client.post(
        `/friendship/request/${encodeURIComponent(receiverId)}`,
      );
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

  // DM 요청하기
  const requestDmMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await client.post(
        `/direct-chat/request/${encodeURIComponent(targetUserId)}`,
      );
    },
    onSuccess: (data) => {
      // 대화방 생성 성공 시 대화방 상세(예: /dm/[roomId])로 이동 로직 추가 가능
      Alert.alert("성공", "DM 요청을 보냈습니다.");
      // router.push(`/dm/${data.data.id}`); // 예시
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "DM 요청에 실패했습니다.",
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navIconButton}
          onPress={() => router.push(`/gathering/${id}`)}
        >
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {gathering ? gathering.title : "모임 채팅방"}
          </Text>
          {gathering && (
            <Text style={styles.headerSubTitle}>
              참가자{" "}
              {gathering.participants?.filter(
                (p: Participant) =>
                  p.status === "APPROVED" || p.status === "YES_SHOW",
              ).length || 0}
              명
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsReportModalOpen(true);
          }}
        >
          <Ionicons name="warning-outline" size={20} color="#FF453A" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isReportModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReportModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={"padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? -20 : -50}
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
                <Text style={styles.inputLabel}>신고할 유저 닉네임</Text>
                <TextInput
                  style={styles.input}
                  value={targetNickname}
                  onChangeText={setTargetNickname}
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
                        style={[styles.chip, isSelected && styles.chipSelected]}
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
                  style={[styles.input, styles.textArea]}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined} // 💡 "undefined" 문자열이 아닌 undefined 값
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : 0} // 💡 Android offset 조정
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFE814" />
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
                <Text style={styles.emptyTitle}>아직 메시지가 없습니다.</Text>
                <Text style={styles.emptySubText}>
                  첫 번째 대화를 시작해 보세요!
                </Text>
              </View>
            ) : (
              visibleMessages.map((msg) => {
                const isMenuOpen = activeMenuUserId === msg.user?.id;
                const isMyMessage = String(msg.userId) === String(me?.id);
                const timeString = new Date(msg.createdAt).toLocaleTimeString(
                  "ko-KR",
                  { hour: "2-digit", minute: "2-digit" },
                );

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
                          activeOpacity={me.id ? 1 : 0.5}
                          onPress={() => {
                            if (msg.user && msg.user.id !== me.id) {
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
                          {msg.user?.nickname || "알 수 없음"}
                        </Text>
                      </View>
                    )}

                    {activeMenuMessageId === msg.id && msg.user && (
                      <View style={styles.inlineTabPopover}>
                        <TouchableOpacity
                          style={styles.popoverItem}
                          onPress={() => {
                            handleCloseMenu();
                            router.push(`/profile/${msg.user?.id}`);
                          }}
                        >
                          <Text style={styles.popoverText}>프로필 보기</Text>
                        </TouchableOpacity>

                        <View style={styles.popoverDivider} />

                        <TouchableOpacity
                          style={styles.popoverItem}
                          onPress={() => {
                            handleCloseMenu();
                            sendFriendRequestMutation.mutate(
                              msg.user?.id || "",
                            );
                          }}
                        >
                          <Text style={styles.popoverText}>친구 요청</Text>
                        </TouchableOpacity>

                        <View style={styles.popoverDivider} />

                        <TouchableOpacity
                          style={styles.popoverItem}
                          onPress={() => {
                            handleCloseMenu();
                            requestDmMutation.mutate(msg.user?.id || "");
                          }}
                        >
                          <Text style={styles.popoverText}>DM 요청</Text>
                        </TouchableOpacity>

                        <View style={styles.popoverDivider} />

                        <TouchableOpacity
                          style={styles.popoverItem}
                          onPress={() => {
                            handleCloseMenu();
                            Alert.alert(
                              "유저 차단",
                              `${msg.user?.nickname}님을 차단하시겠습니까?`,
                              [
                                { text: "취소", style: "cancel" },
                                {
                                  text: "차단",
                                  style: "destructive",
                                  onPress: () =>
                                    blockUserMutation.mutate(
                                      msg.user?.id || "",
                                    ),
                                },
                              ],
                            );
                          }}
                        >
                          <Text
                            style={[styles.popoverText, { color: "#FF5252" }]}
                          >
                            차단
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={styles.bubbleRow}>
                      {isMyMessage && (
                        <Text style={styles.myTimestamp}>{timeString}</Text>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => handleDeletePrompt(msg)}
                        style={[
                          styles.bubble,
                          isMyMessage ? styles.myBubble : styles.otherBubble,
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
                      </TouchableOpacity>

                      {!isMyMessage && (
                        <Text style={styles.otherTimestamp}>{timeString}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
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
          <View style={styles.inputCapsule}>
            <TextInput
              style={styles.textInput}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="#71717A"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              disabled={!messageText.trim()}
              onPress={handleSend}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={messageText.trim() ? "#000" : "#52525B"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    marginTop: 150,
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
    gap: 6,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: "100%",
  },
  myBubble: {
    backgroundColor: "#FFE814",
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
  inputCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,
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
    backgroundColor: "#FFE814",
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
    backgroundColor: Colors.yellow,
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
});
