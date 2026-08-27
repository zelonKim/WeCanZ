import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface UserProfile {
  id: string;
  nickname?: string;
  profileImage?: string;
  noShowCount?: number;
  yesShowCount?: number;
}

export interface Participant {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "BANNED";
  user?: UserProfile;
}

export interface GatheringDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  maxPeople: number;
  location: string;
  dateTime: string;
  status: "OPEN" | "STARTED" | "COMPLETED" | "CANCELLED";
  hostId: string;
  host?: UserProfile;
  participants: Participant[];
}

export default function GatheringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 모임 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // 내 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 상세 정보 조회
  const { data: gathering, isLoading } = useQuery<GatheringDetail>({
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

  const refreshDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    queryClient.invalidateQueries({ queryKey: ["gatherings"] });
  };

  // --- API Mutations ---
  // 1-1. 참여 신청
  const applyMutation = useMutation({
    mutationFn: async () => client.post(`/participant/apply/${id}`),
    onSuccess: () => {
      Alert.alert("성공", "참여 신청이 완료되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "신청 실패"),
  });

  // 1-2. 참여 취소
  const cancelApplyMutation = useMutation({
    mutationFn: async () => client.delete(`/participant/cancel/${id}`), // 백엔드 엔드포인트에 맞춰 수정
    onSuccess: () => {
      Alert.alert("성공", "참여 신청이 취소되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "취소 실패"),
  });

  // 2. 상태 변경: 참가자로 올리기 (APPROVED)
  const approveMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/approve`),
    onSuccess: () => {
      Alert.alert("성공", "참가자로 승인되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "승인 실패"),
  });

  // 3. 상태 변경: 대기자로 내리기 (PENDING)
  const pendMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/pending`),
    onSuccess: () => {
      Alert.alert("성공", "대기 상태로 변경되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "상태 변경 실패"),
  });

  // 4. 상태 변경: 강퇴 (BANNED)
  const banMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/ban`),
    onSuccess: () => {
      Alert.alert("성공", "강퇴 처리되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "강퇴 실패"),
  });

  // 5. 모임 수정/시작/종료/취소
  const updateMutation = useMutation({
    mutationFn: async (dto: any) => client.patch(`/gathering/${id}`, dto),
    onSuccess: () => {
      Alert.alert("성공", "모임 정보가 수정되었습니다.");
      setIsEditModalOpen(false);
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "수정 실패"),
  });

  const startMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/start`),
    onSuccess: () => {
      Alert.alert("성공", "모임이 시작되었습니다! 🔥");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "시작 실패"),
  });

  const completeMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/complete`),
    onSuccess: () => {
      Alert.alert("성공", "모임이 종료되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "종료 실패"),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/cancel`),
    onSuccess: () => {
      Alert.alert("성공", "모임이 취소되었습니다.");
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "취소 실패"),
  });

  if (isLoading || !gathering) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </SafeAreaView>
    );
  }

  // --- 인원 분류 및 카운트 로직 ---
  const approvedParticipants =
    gathering.participants?.filter((p) => p.status === "APPROVED") || [];
  const pendingParticipants =
    gathering.participants?.filter((p) => p.status === "PENDING") || [];

  // 방장(1명) + 승인된 참가자 수
  const currentCount = 1 + approvedParticipants.length;

  const myParticipant = gathering.participants?.find(
    (p) => p.userId === me?.id,
  );

  const openEditModal = () => {
    setEditTitle(gathering.title);
    setEditDescription(gathering.description);
    setEditLocation(gathering.location);
    setIsEditModalOpen(true);
  };

  // 유저 프로필 아이템 렌더링 함수
  const renderUserCard = (
    user?: UserProfile,
    roleTag?: string,
    participantId?: string,
    currentStatus?: "APPROVED" | "PENDING",
  ) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfoLeft}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={Colors.tabIconDefault} />
            </View>
          )}

          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.nickname}</Text>
              {roleTag && <Text style={styles.roleBadge}>{roleTag}</Text>}
            </View>
            <Text style={styles.statsText}>
              ✨ 예스쇼 {user?.yesShowCount ?? 0}회 | 🚫 노쇼{" "}
              {user?.noShowCount ?? 0}회
            </Text>
          </View>
        </View>

        {/* 방장 전용 조작 버튼 */}
        {isHost && participantId && (
          <View style={styles.actionBtnGroup}>
            {currentStatus === "APPROVED" && (
              <TouchableOpacity
                style={styles.btnPending}
                onPress={() => pendMutation.mutate(participantId)}
              >
                <Text style={styles.btnActionText}>
                  <Ionicons name="hourglass-outline" />
                </Text>
              </TouchableOpacity>
            )}

            {currentStatus === "PENDING" && (
              <TouchableOpacity
                style={styles.btnApprove}
                onPress={() => approveMutation.mutate(participantId)}
              >
                <Text style={styles.btnActionText}>
                  <Ionicons name="checkbox-outline" />
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.btnBan}
              onPress={() =>
                Alert.alert("강퇴", "해당 참가자를 강퇴하시겠습니까?", [
                  { text: "취소" },
                  {
                    text: "강퇴",
                    onPress: () => banMutation.mutate(participantId),
                  },
                ])
              }
            >
              <Text style={styles.btnActionText}>
                <Ionicons name="person-remove-outline" />
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>모임 상세 정보</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 방장 관리 메뉴 */}
      {isHost && (
        <View style={styles.hostBox}>
          <Text style={styles.sectionTitle}>👑 방장 관리 메뉴</Text>
          <View style={styles.hostButtonGroup}>
            <TouchableOpacity
              style={[styles.hostBtn, { backgroundColor: "#4A90E2" }]}
              onPress={openEditModal}
            >
              <Text style={styles.hostBtnText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hostBtn, { backgroundColor: "#34C759" }]}
              onPress={() => startMutation.mutate()}
            >
              <Text style={styles.hostBtnText}>시작</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hostBtn, { backgroundColor: Colors.yellow }]}
              onPress={() => completeMutation.mutate()}
            >
              <Text style={styles.hostBtnText}>종료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hostBtn, { backgroundColor: Colors.red }]}
              onPress={() =>
                Alert.alert("경고", "모임을 취소하시겠습니까?", [
                  { text: "아니오" },
                  { text: "네", onPress: () => cancelMutation.mutate() },
                ])
              }
            >
              <Text style={styles.hostBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 상태 및 기본 정보 */}
        <View style={styles.statusRow}>
          <Text style={styles.statusBadge}>{gathering.status}</Text>
          <Text style={styles.categoryText}>{gathering.category}</Text>
        </View>
        <Text style={styles.title}>{gathering.title}</Text>
        <Text style={styles.description}>{gathering.description}</Text>

        <View style={{ marginTop: 20 }} />

        {/* 일정, 장소 및 인원 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.yellow} />
            <Text style={styles.infoText}>{gathering.dateTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.red} />
            <Text style={styles.infoText}>{gathering.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={"white"} />
            <Text style={styles.infoText}>
              참여 인원:{" "}
              <Text style={styles.highlightText}>{currentCount}</Text> /{" "}
              {gathering.maxPeople}명
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={{ marginTop: -10 }} />
        {/* 1. 방장 명단 */}
        <Text style={styles.listSectionTitle}>
          <Ionicons name="flash-outline" size={15} /> 방장
        </Text>
        {renderUserCard(gathering.host, "방장")}

        {/* 2. 참가자 명단 (APPROVED) */}
        <Text style={styles.listSectionTitle}>
          <Ionicons name="checkbox-outline" size={16} /> 참가자
        </Text>
        {approvedParticipants.length === 0 ? (
          <Text style={styles.emptyText}>참가 승인된 멤버가 없습니다.</Text>
        ) : (
          approvedParticipants.map((p) => (
            <React.Fragment key={p.id}>
              {renderUserCard(p.user, undefined, p.id, "APPROVED")}
            </React.Fragment>
          ))
        )}

        {/* 3. 대기자 명단 (PENDING) */}
        <Text style={styles.listSectionTitle}>
          <Ionicons name="hourglass-outline" size={15} /> 대기자
        </Text>
        {pendingParticipants.length === 0 ? (
          <Text style={styles.emptyText}>대기 중인 멤버가 없습니다.</Text>
        ) : (
          pendingParticipants.map((p) => (
            <React.Fragment key={p.id}>
              {renderUserCard(p.user, undefined, p.id, "PENDING")}
            </React.Fragment>
          ))
        )}

        {!isHost && (
          <View style={{ marginTop: 24 }}>
            {myParticipant ? (
              <View style={{ gap: 8 }}>
                {/* 취소 버튼 추가 */}
                {myParticipant.status !== "BANNED" && (
                  <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: "#555" }]}
                    onPress={() =>
                      Alert.alert(
                        "참여 취소",
                        "정말 모임 참여를 취소하시겠습니까?",
                        [
                          { text: "아니오" },
                          {
                            text: "네",
                            onPress: () => cancelApplyMutation.mutate(),
                          },
                        ],
                      )
                    }
                  >
                    <Text style={styles.applyButtonText}>
                      모임 참여 취소하기
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => applyMutation.mutate()}
              >
                <Text style={styles.applyButtonText}>모임 참여 신청하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* 모임 수정 모달 */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>모임 정보 수정</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="제목"
              placeholderTextColor={Colors.tabIconDefault}
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="설명"
              multiline
              placeholderTextColor={Colors.tabIconDefault}
            />
            <TextInput
              style={styles.input}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="장소"
              placeholderTextColor={Colors.tabIconDefault}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#555" }]}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.hostBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.red }]}
                onPress={() =>
                  updateMutation.mutate({
                    title: editTitle,
                    description: editDescription,
                    location: editLocation,
                  })
                }
              >
                <Text style={styles.hostBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  content: { padding: 16, paddingBottom: 40 },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: Colors.yellow,
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: { color: Colors.red, fontWeight: "bold", fontSize: 13 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  description: { fontSize: 15, color: Colors.tabIconDefault, lineHeight: 22 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },

  infoSection: { gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: Colors.text },
  highlightText: { color: Colors.yellow, fontWeight: "bold" },

  hostBox: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  hostButtonGroup: { flexDirection: "row", gap: 6 },
  hostBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  hostBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  listSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 14,
    marginBottom: 10,
  },
  emptyText: { color: Colors.tabIconDefault, fontSize: 13, marginBottom: 10 },

  /* 유저 카드 스타일 */
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfoLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { color: Colors.text, fontSize: 15, fontWeight: "bold" },
  roleBadge: {
    backgroundColor: Colors.red,
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statsText: { color: Colors.tabIconDefault, fontSize: 12, marginTop: 4 },

  actionBtnGroup: { flexDirection: "row", gap: 6 },
  btnApprove: {
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnPending: {
    backgroundColor: "#ff9500e3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnBan: {
    backgroundColor: Colors.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnActionText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },

  applyButton: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  alreadyAppliedBox: {
    backgroundColor: "#2C2C2E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  alreadyAppliedText: { color: Colors.yellow, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
  },
  modalBtnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
