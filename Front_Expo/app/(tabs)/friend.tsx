import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
  receiver?: User;
  nickname?: string;
  profileImage?: string;
}

export default function FriendScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [friendNickname, setFriendNickname] = useState("");
  const [blockNickname, setBlockNickname] = useState("");

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

  // 💡 3. 내가 차단한 유저 목록 조회 (모달 오픈 시 실행)
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
    enabled: isBlockModalVisible,
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

  // 6. 친구 신청
  const handleSendFriendRequest = async () => {
    if (!friendNickname.trim()) {
      Alert.alert("알림", "친구의 닉네임을 입력해주세요");
      return;
    }

    try {
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

  // 7. DM 요청 Mutation
  const requestDmMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      friend,
    }: {
      targetUserId: string;
      friend: User;
    }) => {
      const response = await client.post(
        `/direct-chat/request/${targetUserId}`,
      );
      return { roomData: response.data, friend };
    },
    onSuccess: ({ roomData, friend }) => {
      const chatRoomId = roomData.id;
      router.push({
        pathname: "/DM/[id]",
        params: {
          id: chatRoomId,
          name: friend.nickname,
          profileImage: friend.profileImage || "",
        },
      });
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "DM 이동에 실패했습니다.",
      );
    },
  });

  // 8. 차단 해제 Mutation
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

  // 9. 유저 차단 Mutation
  const blockUserMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.patch(`/friendship/block/${targetUserId}`),
    onSuccess: () => {
      Alert.alert("성공", "유저를 차단했습니다.");
      setBlockNickname("");
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

  // 💡 10. 닉네임으로 검색해서 직접 차단하기
  const handleBlockByNickname = async () => {
    if (!blockNickname.trim()) {
      Alert.alert("알림", "차단할 유저의 닉네임을 입력해주세요.");
      return;
    }

    try {
      const res = await client.get(`/user/search/${blockNickname}`);
      blockUserMutation.mutate(res.data.id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "존재하지 않거나 검색할 수 없는 유저입니다.";
      Alert.alert("알림", errorMessage);
    }
  };

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
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 나의 친구</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsAddModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={Colors.yellow}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsBlockModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="person-remove-outline"
              size={24}
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

              <View style={styles.actionIconGroup}>
                <TouchableOpacity
                  style={styles.dmActionBtn}
                  onPress={() =>
                    requestDmMutation.mutate({ targetUserId, friend })
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={22}
                    color={Colors.card}
                  />
                </TouchableOpacity>

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

      {/* 친구 추가 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
          style={{ flex: 1 }}
        >
          <View style={styles.addModalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.addModalTitle}>👋 친구 추가</Text>
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
        </KeyboardAvoidingView>
      </Modal>

      {/* 💡 [복합 모달] 차단하기(닉네임 입력) + 차단 유저 목록 확인 및 차단 해제 */}
      <Modal
        visible={isBlockModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBlockModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsBlockModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContentCard}
              onPress={(e) => e.stopPropagation()}
            >
              {/* 모달 헤더 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚫 차단 관리</Text>
                <TouchableOpacity onPress={() => setIsBlockModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.text || "#212529"}
                  />
                </TouchableOpacity>
              </View>

              {/* 1. 닉네임 직접 입력 차단 영역 */}
              <View style={styles.directBlockContainer}>
                <TextInput
                  style={styles.directBlockInput}
                  placeholder="닉네임 입력"
                  placeholderTextColor="#888"
                  value={blockNickname}
                  onChangeText={setBlockNickname}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.directBlockBtn}
                  onPress={handleBlockByNickname}
                >
                  <Text style={styles.directBlockBtnText}>차단 하기</Text>
                </TouchableOpacity>
              </View>

              {/* 구분선 */}
              <View style={styles.divider} />

              <Text style={styles.subListTitle}>
                차단된 친구 목록 ({blockedUsers.length})
              </Text>

              {/* 2. 차단 유저 목록 및 차단 해제 FlatList */}
              <FlatList
                data={blockedUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalListContent}
                style={{ maxHeight: 350 }}
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
                    <Text style={styles.emptyText}>
                      차단한 유저가 없습니다.
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
    backgroundColor: Colors.tabIconDefault,
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

  // 💡 반투명 모달용 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContentCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#212529",
  },
  modalListContent: {
    paddingVertical: 4,
  },

  // 💡 닉네임 즉시 차단 입력 폼 스타일
  directBlockContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  directBlockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border || "#E9ECEF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
    height: 42,
  },
  directBlockBtn: {
    backgroundColor: Colors.red || "#FF3B30",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  directBlockBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border || "#E9ECEF",
    marginVertical: 12,
  },
  subListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text || "#212529",
    marginBottom: 8,
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
    backgroundColor: "#2C2C2E",
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#FFF",
    fontSize: 15,
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
    backgroundColor: Colors.yellow,
  },
  submitBtnText: {
    color: Colors.card,
    fontWeight: "bold",
    fontSize: 14,
  },
});
