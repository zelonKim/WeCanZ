import { client } from "@/api/client";
import { getSocket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"; // 💡 탭바 높이 가져오기
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Image,
  KeyboardAvoidingView,
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

  // 2. 메시지 목록 조회
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["gathering-messages", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering-chat/${id}/messages`);
      return data;
    },
    enabled: !!id,
  });

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
      } else if (nextAppState.match(/inactive|background/)) {
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
    if (!messageText.trim() || !socketRef.current || !me?.id) return;

    socketRef.current.emit("sendGatheringMessage", {
      gatheringId: id,
      userId: me.id,
      message: messageText.trim(),
    });

    setMessageText("");
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
              참가자 {gathering.participants?.length || 1}명
            </Text>
          )}
        </View>
        <View style={{ width: 38 }} />
      </View>

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
            {messages.length === 0 ? (
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
              messages.map((msg) => {
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
                        {msg.user?.profileImage ? (
                          <Image
                            source={{ uri: msg.user.profileImage }}
                            style={styles.profileImage}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={14} color="#8E8E93" />
                          </View>
                        )}
                        <Text style={styles.senderName}>
                          {msg.user?.nickname || "알 수 없음"}
                        </Text>
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

        {/* 💡 하단 입력 바 (탭바 및 Inset 고려한 패딩값 설정) */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom:
                Platform.OS === "ios"
                  ? Math.max(insets.bottom, 12)
                  : tabBarHeight > 0
                    ? 12
                    : Math.max(insets.bottom, 12),
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
    backgroundColor: "#0F0F12",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
    width: 26,
    height: 26,
    borderRadius: 13,
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
    fontWeight: "600",
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
    paddingTop: 8,
    backgroundColor: "#0F0F12",
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
});
