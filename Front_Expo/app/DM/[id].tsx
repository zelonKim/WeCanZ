import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { getSocket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

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

  // 내 정보 조회
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await client.get("/user/me");
      // axios/client 설정에 따라 res.data 혹은 res.data.data 확인
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
      } else if (nextAppState.match(/inactive|background/)) {
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
  const handleSend = () => {
    console.log("Send Check:", {
      text: inputText.trim(),
      myInfoId: myInfo?.id,
      roomId,
      socketConnected: socketRef.current?.connected,
    });

    if (!inputText.trim() || !myInfo?.id || !roomId || !socketRef.current) {
      console.warn("DM 전송 조건 미충족");
      return;
    }

    const messageText = inputText.trim();

    setInputText("");

    // 💡 sender 객체도 함께 포함시켜 상태 업데이트
    const tempMessage: DirectChatMessage = {
      id: `temp-${Date.now()}`,
      message: messageText,
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
    });
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

  // 방 나가기
  const leaveRoomMutation = useMutation({
    mutationFn: () => client.delete(`/direct-chat/rooms/${roomId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
      router.back();
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "방 나가기에 실패했습니다.",
      );
    },
  });

  const handleLeaveRoom = () => {
    Alert.alert("나가기", "정말 메시지방을 나가시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "나가기",
        style: "destructive",
        onPress: () => leaveRoomMutation.mutate(),
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
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Ionicons name="person" size={20} color={Colors.text} />
            </View>
          )}

          <Text style={styles.headerNickname} numberOfLines={1}>
            {name || "알 수 없음"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleLeaveRoom}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF453A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.yellow} />
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
                  <Text style={styles.timeText}>
                    {formatTime(item.createdAt)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: insets.bottom || 12 },
          ]}
        >
          {isBlocked ? (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedText}>
                차단한 유저와는 대화할 수 없습니다.
              </Text>
            </View>
          ) : (
            <>
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
                  !inputText.trim() && styles.disabledSendButton,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="arrow-up" size={20} color={Colors.card} />
              </TouchableOpacity>
            </>
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
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: Colors.yellow,
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
  },
  otherText: {
    color: "#F2F2F7",
  },
  timeText: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.yellow,
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
});
