import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
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

interface FriendshipRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  sender: User;
}

interface FriendItem {
  id: string;
  friendUser: User;
}

// 차단된 유저 항목 타입
interface BlockedUserItem {
  id: string;
  receiver?: User; // 백엔드 응답 형태에 맞춰 조절 (blockedUser 객체 혹은 user 객체)
  nickname?: string;
  profileImage?: string;
}

export default function FriendScreen() {
  const queryClient = useQueryClient();
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [friendNickname, setFriendNickname] = useState("");

  // 1. 받은 친구 요청 목록 조회
  const {
    data: pendingRequests = [],
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<FriendshipRequest[]>({
    queryKey: ["friend-requests-pending"],
    queryFn: async () => {
      const { data } = await client.get("/friendship/requests/pending");
      return data;
    },
  });

  // 2. 내 친구 목록 조회
  const {
    data: myFriends = [],
    isLoading: isFriendsLoading,
    refetch: refetchFriends,
  } = useQuery<FriendItem[]>({
    queryKey: ["my-friends"],
    queryFn: async () => {
      const { data } = await client.get("/friendship");
      return data;
    },
  });

  // 💡 3. 내가 차단한 유저 목록 조회 (GET /friendship/blocked)
  const {
    data: blockedUsers = [],
    isLoading: isBlockedLoading,
    refetch: refetchBlocked,
  } = useQuery<BlockedUserItem[]>({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const { data } = await client.get("/friendship/blocked");
      return data;
    },
    enabled: isBlockModalVisible, // 모달이 열렸을 때만 쿼리 실행
  });

  // 4. 친구 요청 수락
  const acceptMutation = useMutation({
    mutationFn: (friendshipId: string) =>
      client.patch(`/friendship/${friendshipId}/accept`),
    onSuccess: () => {
      Alert.alert("성공", "친구 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "수락에 실패했습니다.",
      );
    },
  });

  // 5. 친구 요청 거절
  const rejectMutation = useMutation({
    mutationFn: (friendshipId: string) =>
      client.patch(`/friendship/${friendshipId}/reject`),
    onSuccess: () => {
      Alert.alert("알림", "친구 요청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "거절에 실패했습니다.",
      );
    },
  });

  // 6. 친구 신청 API 호출 함수
  const handleSendFriendRequest = async () => {
    if (!friendNickname.trim()) {
      Alert.alert("알림", "친구의 닉네임을 입력해주세요");
      return;
    }

    try {
      // 닉네임으로 id를 찾는 API 호출 후 전송
      const res = await client.get(`/user/search/${friendNickname}`);
      await client.post(`/friendship/request/${res.data.id}`);

      setIsAddModalVisible(false);
      setFriendNickname("");
      Alert.alert("알림", "친구 요청을 보냈습니다.");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "오류로 인해 친구 요청에 실패했습니다.";

      Alert.alert("알림", errorMessage);
    }
  };

  // 💡 7. 차단 해제
  const unblockMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.patch(`/friendship/unblock/${targetUserId}`),
    onSuccess: () => {
      Alert.alert("성공", "차단이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.response?.data?.message || "차단 해제 실패");
    },
  });

  // 💡 8. DM 요청 Mutation
  const requestDmMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.post(`/direct-chat/request/${targetUserId}`),
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

  // 💡 9. 유저 차단 Mutation
  const blockUserMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.patch(`/friendship/block/${targetUserId}`),
    onSuccess: () => {
      Alert.alert("성공", "유저를 차단했습니다.");
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "유저 차단에 실패했습니다.",
      );
    },
  });

  const isRefreshing = isPendingLoading || isFriendsLoading;

  const onRefresh = () => {
    refetchPending();
    refetchFriends();
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 💡 헤더 영역: 우측 상단에 차단 목록 아이콘 버튼 추가 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 나의 친구</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsAddModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="person-add-outline" size={22} color={Colors.blue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsBlockModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="person-remove-outline"
              size={22}
              color={Colors.red}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 메인 친구 목록 FlatList */}
      <FlatList
        data={myFriends}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                받은 친구 요청 ({pendingRequests.length})
              </Text>
            </View>

            {pendingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>받은 친구 요청이 없습니다.</Text>
              </View>
            ) : (
              pendingRequests.map((req) => (
                <View key={req.id} style={styles.card}>
                  <View style={styles.userInfo}>
                    {renderAvatar(req.sender?.profileImage)}
                    <Text style={styles.nickname}>
                      {req.sender?.nickname || "알 수 없는 유저"}
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
              ))
            )}

            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>
                친구 목록 ({myFriends.length})
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const friend = item.friendUser || (item as any);
          const targetUserId = friend.id || item.id;

          return (
            <View style={styles.card}>
              <View style={styles.userInfo}>
                {renderAvatar(friend.profileImage)}
                <Text style={styles.nickname}>{friend.nickname}</Text>
              </View>

              {/* 💡 우측 아이콘 버튼 그룹 */}
              <View style={styles.actionIconGroup}>
                {/* DM 요청 버튼 */}
                <TouchableOpacity
                  style={styles.dmActionBtn}
                  onPress={() => requestDmMutation.mutate(targetUserId)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={22}
                    color={Colors.card}
                  />
                </TouchableOpacity>

                {/* 차단하기 버튼 */}
                <TouchableOpacity
                  style={styles.blockActionBtn}
                  onPress={() =>
                    Alert.alert(
                      "유저 차단",
                      `${friend.nickname}님을 차단하시겠습니까?`,
                      [
                        { text: "취소", style: "cancel" },
                        {
                          text: "차단",
                          style: "destructive",
                          onPress: () => blockUserMutation.mutate(targetUserId),
                        },
                      ],
                    )
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="person-remove-outline"
                    size={22}
                    color={Colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 등록된 친구가 없습니다.</Text>
          </View>
        }
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.addModalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.addModalTitle}>🔍 친구 추가</Text>
            <Text style={styles.modalSubtitle}>
              추가할 친구의 닉네임을 입력해주세요.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="닉네임 입력"
              placeholderTextColor="#888"
              value={friendNickname}
              onChangeText={setFriendNickname}
              autoCapitalize="none"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setIsAddModalVisible(false);
                  setFriendNickname("");
                }}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleSendFriendRequest}
              >
                <Text style={styles.submitBtnText}>요청 보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 💡 [모달] 차단한 유저 목록 및 차단 해제 */}
      <Modal
        visible={isBlockModalVisible}
        transparent={true} // 1. 배경을 투명하게 허용
        animationType="fade" // 또는 "slide"
        onRequestClose={() => setIsBlockModalVisible(false)}
      >
        {/* 2. 뒷배경 (어두운 반투명 오버레이 & 클릭 시 모달 닫기) */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsBlockModalVisible(false)}
        >
          {/* 3. 실제 모달 콘텐츠 영역 (클릭 이벤트 전파 방지) */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContentCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* 모달 핸들 바  */}
            {/* <View style={styles.modalHandle} /> */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🚫 차단한 유저 목록</Text>
              <TouchableOpacity onPress={() => setIsBlockModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.text || "#212529"}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={blockedUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalListContent}
              style={{ maxHeight: 500 }} // 모달의 최대 높이 지정
              refreshControl={
                <RefreshControl
                  refreshing={isBlockedLoading}
                  onRefresh={refetchBlocked}
                />
              }
              renderItem={({ item }) => {
                const user = item.receiver || (item as any);
                const targetUserId = user.id || item.id;

                return (
                  <View style={styles.card}>
                    <View style={styles.userInfo}>
                      {renderAvatar(user.profileImage)}
                      <Text style={styles.nickname}>
                        {user.nickname || "알 수 없음"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.btnUnblock}
                      onPress={() =>
                        Alert.alert(
                          "차단 해제",
                          `${user.nickname || "알 수 없음"}님을 차단 해제 하시겠습니까?`,
                          [
                            { text: "취소", style: "cancel" },
                            {
                              text: "해제",
                              onPress: () =>
                                unblockMutation.mutate(targetUserId),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.btnUnblockText}>차단 해제</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>차단한 유저가 없습니다.</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
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
    padding: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card || "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  btnUnblock: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnUnblockText: {
    color: "#FFFFFF",
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

  // 💡 반투명 모달용 추가/수정 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 뒷배경 투명도 (어두운 반투명)
    justifyContent: "center", // 바텀시트처럼 하단에 배치 (중앙 배치를 원하시면 'center'로 변경)
  },
  modalContentCard: {
    backgroundColor: Colors.background || "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,

    paddingBottom: 30,
    paddingTop: 12,
    maxHeight: "80%", // 화면의 70% 까지만 차지하도록 설정
    // 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border || "#D1D1D6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#212529",
  },
  modalListContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background || "#F8F9FA",
  },

  actionIconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  dmActionBtn: {
    padding: 6,
    backgroundColor: Colors.yellow,
    borderRadius: 12,
  },

  blockActionBtn: {
    padding: 6,
    backgroundColor: Colors.red,
    borderRadius: 12,
  },

  addModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.tabIconDefault,
    marginBottom: 18,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.tabIconDefault,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
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
    backgroundColor: "#f1f1f1",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#007AFF",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
