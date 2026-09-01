import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { getSocket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface DirectChatRoom {
  id: string; // roomId
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user1Id: string;
  user2Id: string;
  user1?: User;
  user2?: User;
  sender?: User; // 백엔드에서 DM 신청한 유저 정보를 sender로 주는 경우 대응
  targetUser?: User; // 채팅 상대방 유저 정보
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  hasUnread?: boolean;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

export default function DMScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 💡 DM 요청 모달 및 닉네임 상태 추가
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");

  // 1. 들어온 DM 요청 목록 조회
  const {
    data: pendingRequests = [],
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-requests-pending"],
    queryFn: async () => {
      const { data } = await client.get("/direct-chat/requests/pending");
      return data;
    },
  });

  // 2. 수락된 DM 목록 조회
  const {
    data: myDMRooms = [],
    isLoading: isRoomsLoading,
    refetch: refetchRooms,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-rooms"],
    queryFn: async () => {
      const { data } = await client.get("/direct-chat/rooms");
      return data;
    },
  });

  // 3. DM 요청 수락
  const acceptMutation = useMutation({
    mutationFn: (roomId: string) =>
      client.patch(`/direct-chat/${roomId}/accept`),
    onSuccess: () => {
      Alert.alert("성공", "DM 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["dm-rooms"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "수락에 실패했습니다.",
      );
    },
  });

  // 4. DM 요청 거절
  const rejectMutation = useMutation({
    mutationFn: (roomId: string) =>
      client.patch(`/direct-chat/${roomId}/reject`),
    onSuccess: () => {
      Alert.alert("알림", "DM 요청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "거절에 실패했습니다.",
      );
    },
  });

  // 💡 5. DM 요청 보내기 Mutation
  const requestDmMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.post(`/direct-chat/request/${targetUserId}`),
    onSuccess: () => {
      Alert.alert("성공", "DM 요청을 보냈습니다.");
      setIsModalVisible(false);
      setTargetNickname("");
      queryClient.invalidateQueries({ queryKey: ["dm-requests-pending"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "DM 요청에 실패했습니다.",
      );
    },
  });

  // 💡 닉네임 검색 후 DM 요청 처리
  const handleSendDmRequest = async () => {
    if (!targetNickname.trim()) {
      Alert.alert("알림", "상대방 닉네임을 입력해주세요.");
      return;
    }

    try {
      const res = await client.get(`/user/search/${targetNickname}`);
      requestDmMutation.mutate(res.data.id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "존재하지 않거나 검색할 수 없는 유저입니다.";
      Alert.alert("알림", errorMessage);
    }
  };

  const isRefreshing = isPendingLoading || isRoomsLoading;

  const onRefresh = () => {
    refetchPending();
    refetchRooms();
  };

  const renderAvatar = (profileImage?: string) => {
    if (profileImage) {
      return <Image source={{ uri: profileImage }} style={styles.avatar} />;
    }
    return (
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person" size={22} color={Colors.text || "#333"} />
      </View>
    );
  };

  // 내 정보 조회
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 화면 포커스 시 자동으로 최신 목록 불러오기
  useFocusEffect(
    useCallback(() => {
      refetchRooms();
      refetchPending();
    }, [refetchRooms, refetchPending]),
  );

  // 소켓 연결 및 실시간 DM 목록 업데이트 수신
  useEffect(() => {
    if (!myInfo?.id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("🟢 [Socket] Connected:", socket.id);
      socket.emit("joinUserRoom", { userId: myInfo.id });
    };

    const handleDmListUpdate = (payload: {
      roomId: string;
      lastMessage: any;
      senderId: string;
    }) => {
      console.log("⚡ [Socket] dmListUpdated 수신됨:", payload);

      queryClient.setQueryData<DirectChatRoom[]>(["dm-rooms"], (oldRooms) => {
        if (!oldRooms) return [];

        return oldRooms.map((room) => {
          if (room.id === payload.roomId) {
            const isFromOpponent = payload.senderId !== myInfo.id;
            return {
              ...room,
              lastMessage: payload.lastMessage,
              hasUnread: isFromOpponent ? true : room.hasUnread,
            };
          }
          return room;
        });
      });
    };

    if (socket.connected) {
      socket.emit("joinUserRoom", { userId: myInfo.id });
    }

    socket.on("connect", handleConnect);
    socket.on("dmListUpdated", handleDmListUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("dmListUpdated", handleDmListUpdate);
    };
  }, [myInfo?.id, queryClient]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 다이렉트 메시지</Text>
        {/* 💡 DM 보내기 아이콘 버튼 추가 */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={Colors.yellow || "#FFD600"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myDMRooms}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                받은 DM 요청 ({pendingRequests.length})
              </Text>
            </View>

            {pendingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>받은 DM 요청이 없습니다.</Text>
              </View>
            ) : (
              pendingRequests.map((req) => {
                const requester = req.sender || req.user1;

                return (
                  <View key={req.id} style={styles.card}>
                    <View style={styles.userInfo}>
                      {renderAvatar(requester?.profileImage)}
                      <Text style={styles.nickname}>
                        {requester?.nickname || "알 수 없는 유저"}
                      </Text>
                    </View>

                    <View style={styles.actionGroup}>
                      <TouchableOpacity
                        style={styles.btnAccept}
                        onPress={() => acceptMutation.mutate(req.id)}
                      >
                        <Text style={styles.btnAcceptText}>수락</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnReject}
                        onPress={() => rejectMutation.mutate(req.id)}
                      >
                        <Text style={styles.btnRejectText}>거절</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>
                대화 중인 DM ({myDMRooms.length})
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const partner = item.targetUser;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.6}
              onPress={() => {
                queryClient.setQueryData<DirectChatRoom[]>(
                  ["dm-rooms"],
                  (oldRooms) =>
                    oldRooms?.map((r) =>
                      r.id === item.id ? { ...r, hasUnread: false } : r,
                    ),
                );
                router.push({
                  pathname: "/DM/[id]",
                  params: {
                    id: item.id,
                    name: partner?.nickname,
                    profileImage: partner?.profileImage,
                  },
                });
              }}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {renderAvatar(partner?.profileImage)}
                  {item.hasUnread && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>N</Text>
                    </View>
                  )}
                </View>

                <View style={styles.textContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={styles.nickname}>{partner?.nickname}</Text>
                    {item.hasUnread && <View style={styles.dotBadge} />}
                  </View>

                  {item.lastMessage && (
                    <Text
                      style={[
                        styles.lastMessage,
                        item.hasUnread && styles.unreadMessageText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage.content ||
                        (item.lastMessage as any).message}
                    </Text>
                  )}
                </View>
              </View>

              {item.lastMessage?.createdAt && (
                <Text style={styles.timeText}>
                  {formatTime(item.lastMessage.createdAt)}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              참여 중인 DM 대화방이 없습니다.
            </Text>
          </View>
        }
      />

      {/* 💡 [모달 추가] 닉네임 입력 기반 DM 요청 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✉️ DM 요청</Text>
            <Text style={styles.modalSubtitle}>
              DM을 요청할 유저의 닉네임을 입력해주세요.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="닉네임 입력"
              placeholderTextColor="#888"
              value={targetNickname}
              onChangeText={setTargetNickname}
              autoCapitalize="none"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setIsModalVisible(false);
                  setTargetNickname("");
                }}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleSendDmRequest}
              >
                <Text style={styles.submitBtnText}>요청 보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text || "#212529",
  },
  iconBtn: {
    padding: 6,
    borderRadius: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#8E8E93",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text || "#212529",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border || "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  nickname: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text || "#212529",
  },
  lastMessage: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: Platform.OS === "ios" ? 6 : 2,
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  btnAccept: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAcceptText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  btnReject: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnRejectText: {
    color: "#495057",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  avatarContainer: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
  unreadMessageText: {
    fontWeight: "600",
    color: "#8E8E93",
  },

  // 💡 DM 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#212529",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.tabIconDefault || "#888",
    marginBottom: 18,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.tabIconDefault || "#E9ECEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text || "#212529",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F1F1",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Colors.yellow || "#FFD600",
  },
  submitBtnText: {
    color: Colors.card || "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
