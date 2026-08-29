import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { getSocket } from "@/lib/socket";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
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
      hour: "numeric", //
      minute: "2-digit", // 분은 두 자리 고정 (예: 05분 -> 05)
      hour12: true, // 오전/오후 12시간제 적용
    });
  }
  // 올해 보낸 메시지: "3월 15일"
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
  // 작년 이전에 보낸 메시지: "2025.03.15"
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DMScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. 들어온 DM 요청 목록 조회 (GET /direct-chat/requests/pending)
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

  // 2. 수락된 DM 목록 조회 (GET /direct-chat/rooms)
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

  // 3. DM 요청 수락 (PATCH /direct-chat/:roomId/accept)
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

  // 4. DM 요청 거절 (PATCH /direct-chat/:roomId/reject)
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

  // 내 정보 조회 (소켓 개별 룸 입장용)
  const { data: myInfo } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 💡 화면 포커스 시 자동으로 최신 목록 불러오기
  useFocusEffect(
    useCallback(() => {
      refetchRooms();
      refetchPending();
    }, [refetchRooms, refetchPending]),
  );


  
  // 💡 소켓 연결 및 실시간 DM 목록 업데이트 수신
  useEffect(() => {
    if (!myInfo?.id) return;

    const socket = getSocket();

    // 연결되어 있지 않다면 연결
    if (!socket.connected) {
      socket.connect();
    }

    // 소켓 연결 성공 시 개인 룸 입장
    const handleConnect = () => {
      console.log("🟢 [Socket] Connected:", socket.id);
      socket.emit("joinUserRoom", { userId: myInfo.id });
    };

    // 실시간 DM 목록 업데이트 처리
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

    // 이미 연결된 상태라면 즉시 룸 입장 요청
    if (socket.connected) {
      socket.emit("joinUserRoom", { userId: myInfo.id });
    }

    // 이벤트 리스너 등록
    socket.on("connect", handleConnect);
    socket.on("dmListUpdated", handleDmListUpdate);

    return () => {
      // 💡 [핵심] 화면을 나갈 때는 socket.disconnect()를 부르지 말고, 리스너만 제거합니다!
      socket.off("connect", handleConnect);
      socket.off("dmListUpdated", handleDmListUpdate);
    };
  }, [myInfo?.id, queryClient]);



  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 다이렉트 메시지</Text>
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
                // 신청한 유저 매핑 (sender 또는 user1)
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
                  params: { id: item.id, name: partner?.nickname },
                });
              }}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  {renderAvatar(partner?.profileImage)}
                  {/* 💡 NEW 뱃지 배치 */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F8F9FA",
  },
  header: {
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 왼쪽(유저정보)과 오른쪽(시간)을 양끝으로 배치
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // 상대적으로 큰 영역을 차지하도록 설정
    marginRight: 8, // 시간 텍스트와 겹치지 않게 여백 부여
  },
  textContainer: {
    flex: 1, // 긴 메시지 말줄임표(...) 처리를 위해 필요
    marginLeft: 12,
  },

  // 💡 timeText 추천 스타일
  timeText: {
    fontSize: 12,
    color: "#8E8E93", // 은은한 회색
    alignSelf: "flex-start", // 카드 상단 노출을 원할 경우 (중앙 정렬을 원하면 안 써도 됨)
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
  // 아바타 우측 상단 N 뱃지
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
  // 닉네임 옆 작은 빨간 점
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
  // 안 읽은 메시지는 텍스트 강조
  unreadMessageText: {
    fontWeight: "600",
    color: "#8E8E93",
  },
});
