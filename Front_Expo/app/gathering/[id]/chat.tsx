import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

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

  /////////////////////////////////////////////////////////

  // 2. 초기 과거 메시지 목록 조회
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["gathering-messages", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering-chat/${id}/messages`);
      return data;
    },
    enabled: !!id,
  });

  /////////////////////////////////////////////////////////

  // 3. 웹소켓 실시간 연결 및 이벤트 핸들링
  useEffect(() => {
    if (!id) return;

    // 소켓 연결 생성
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true, // 자동 재연결 활성화
      reconnectionAttempts: Infinity, // 계속 재연결 시도
      reconnectionDelay: 1000, // 1초 뒤 재연결 시도
      reconnectionDelayMax: 5000, // 최대 대기 시간
      timeout: 20000,
    });
    socketRef.current = socket;

    // 모임 채팅방 입장 이벤트 발송 (ChatGateway handleJoinRoom 대응)
    socket.emit("joinGatheringRoom", { gatheringId: id });

    // 실시간 신규 메시지 수신 (ChatGateway sendGatheringMessage의 emit 수신)
    socket.on("newGatheringMessage", (newMessage: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["gathering-messages", id],
        (oldMessages = []) => {
          // 중복 메시지 방지
          if (oldMessages.some((msg) => msg.id === newMessage.id)) {
            return oldMessages;
          }
          return [...oldMessages, newMessage];
        },
      );
    });

    socket.on(
      "gatheringMessageDeleted",
      ({ messageId }: { messageId: string }) => {
        queryClient.setQueryData<ChatMessage[]>(
          ["gathering-messages", id],
          (oldMessages = []) =>
            oldMessages.filter((msg) => msg.id !== messageId),
        );
      },
    );

    // 클린업: 화면 이탈 시 방 퇴장 및 소켓 연결 해제
    return () => {
      socket.emit("leaveGatheringRoom", { gatheringId: id });
      socket.disconnect();
    };
  }, [id, queryClient]);

  // 네트워크 변동 감지 및 자동 재연결
  useEffect(() => {
    if (!id) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      // 인터넷이 연결되었고, 소켓이 끊어져 있는 상태라면 재연결 시도
      if (
        state.isConnected &&
        socketRef.current &&
        !socketRef.current.connected
      ) {
        console.log("네트워크 감지: 소켓 재연결 및 메시지 갱신");

        socketRef.current.connect();
        // 끊겨 있던 동안 받지 못한 과거 메시지 목록 HTTP API로 다시 최신화
        queryClient.invalidateQueries({ queryKey: ["gathering-messages", id] });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  /////////////////////////////////////////////////////////

  // 4. 메시지 전송 (웹소켓 방식)
  const handleSend = () => {
    if (!messageText.trim() || !socketRef.current || !me?.id) return;

    // ChatGateway의 handleSendMessage 구조에 맞춰 소켓 이벤트 발송
    socketRef.current.emit("sendGatheringMessage", {
      gatheringId: id,
      userId: me.id,
      message: messageText.trim(),
    });

    setMessageText("");
  };

  /////////////////////////////////////////////////////////


  // 5. 메시지 삭제 (웹소켓 방식)
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

          // 웹소켓 이벤트 발송
          socketRef.current.emit("deleteGatheringMessage", {
            gatheringId: id,
            messageId: msg.id,
            userId: me.id,
          });
        },
      },
    ]);
  };

  /////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {gathering ? `${gathering.title}` : "모임 채팅방"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.divider} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.yellow} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatScroll}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.emptyText}>첫 메시지를 남겨보세요!</Text>
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
                          <Ionicons
                            name="person-circle-outline"
                            size={30}
                            color={Colors.text}
                          />
                        )}
                        <Text style={styles.senderName}>
                          {msg.user?.nickname || "알 수 없음"}
                        </Text>
                      </View>
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

                    <Text
                      style={[
                        styles.timestamp,
                        isMyMessage
                          ? styles.myTimestamp
                          : styles.otherTimestamp,
                      ]}
                    >
                      {timeString}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* 하단 입력 바 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor={Colors.tabIconDefault}
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
              name="send"
              size={18}
              color={messageText.trim() ? Colors.card : "#666"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },

  chatScroll: { padding: 16, paddingBottom: 20 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 10,
  },
  emptyText: { color: Colors.tabIconDefault, fontSize: 14 },

  messageWrapper: { marginBottom: 12, maxWidth: "75%" },
  myMessageWrapper: { alignSelf: "flex-end", alignItems: "flex-end" },
  otherMessageWrapper: { alignSelf: "flex-start", alignItems: "flex-start" },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Colors.yellow,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  myMessageText: { color: Colors.card, fontWeight: "500" },
  otherMessageText: { color: Colors.text },

  timestamp: {
    fontSize: 10,
    color: Colors.tabIconDefault,
    marginTop: 4,
    marginHorizontal: 4,
  },
  myTimestamp: { textAlign: "right" },
  otherTimestamp: { textAlign: "left" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
    marginBottom: Platform.OS === "android" ? 48 : 0,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  senderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  // 프로필 이미지 스타일
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14, // 원형으로 잘라내기
  },

  // 기존 senderName 스타일 수정 (margin 제거)
  senderName: {
    fontSize: 12,
    color: Colors.text,
  },
});
