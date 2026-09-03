import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { formatDateTime } from "@/utils/formatDateTime";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { GatheringCategory } from "../../(tabs)";

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
  status: "OPEN" | "FULL" | "IN_PROGRESS" | "CANCELED" | "COMPLETED";
  roomCode?: string;
  hostId: string;
  host?: UserProfile;
  participants: {
    id: string;
    userId: string;
    status: string;
    user: UserProfile;
  }[];
}

export interface EditGatheringDto {
  title?: string;
  description?: string;
  category?: string;
  maxPeople?: number;
  location?: string;
  dateTime?: string;
}

const HOURS = [
  17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16,
];
const MINUTES = [0, 10, 20, 30, 40, 50];

// 상태 한글 매핑
const STATUS_LABEL: Record<string, string> = {
  OPEN: "모집 중",
  FULL: "인원 마감",
  IN_PROGRESS: "진행 중",
  CANCELED: "취소됨",
  COMPLETED: "종료됨",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: Colors.blue, text: Colors.text },
  FULL: { bg: Colors.red, text: Colors.text },
  IN_PROGRESS: { bg: Colors.red, text: Colors.text },
  CANCELED: { bg: Colors.red, text: Colors.text },
  COMPLETED: { bg: Colors.orange, text: Colors.text },
};

// 카테고리 한글 매핑
const CATEGORY_LABEL: Record<string, string> = {
  DRINK: "🍺 술벙",
  CLUB: Platform.OS === "ios" ? "🪩 클럽벙" : "🎉 클럽벙",
  DRINK_CLUB: "🔥 술+클럽벙",
};

////////////////////////////////////////////////////////

export default function GatheringDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showActionSheetWithOptions } = useActionSheet();

  const refreshDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    queryClient.invalidateQueries({ queryKey: ["my-gatherings"] });
  };

  // 상세 정보 조회
  const {
    data: gathering,
    isLoading,
    refetch: gatheringRefetch,
  } = useQuery<GatheringDetail>({
    queryKey: ["gathering", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering/${id}`);
      return data;
    },

    enabled: !!id,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  /////////////////////////////////////////////////////////////

  // 모임 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(GatheringCategory.DRINK);
  const [maxPeople, setMaxPeople] = useState<number | string>("");
  const [location, setLocation] = useState<string>("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const openEditModal = () => {
    if (!gathering) return;

    setTitle(gathering.title);
    setDescription(gathering.description);
    setLocation(gathering.location);
    setCategory(gathering.category);
    setMaxPeople(gathering.maxPeople);

    if (gathering.dateTime) {
      const gDate = new Date(gathering.dateTime);
      const year = gDate.getFullYear();
      const month = String(gDate.getMonth() + 1).padStart(2, "0");
      const day = String(gDate.getDate()).padStart(2, "0");
      setSelectedDateStr(`${year}-${month}-${day}`);
      setSelectedHour(gDate.getHours());
      setSelectedMinute(gDate.getMinutes());
    }

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const editGathering = async (dto: EditGatheringDto) => {
    const { data } = await client.patch(`/gathering/${id}`, dto);
    return data;
  };

  const editMutation = useMutation({
    mutationFn: editGathering,
    onSuccess: async () => {
      Alert.alert("성공", "모임이 수정되었습니다!");
      await gatheringRefetch();
      refreshDetail();
      closeEditModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "모임 수정에 실패했습니다.";
      Alert.alert("오류", Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleEditGathering = () => {
    if (!title?.trim()) return Alert.alert("경고", "제목을 입력해주세요.");
    if (!description?.trim())
      return Alert.alert("경고", "설명을 입력해주세요.");
    if (!location?.trim())
      return Alert.alert("경고", "모임 장소를 입력해주세요.");

    if (!maxPeople || isNaN(Number(maxPeople))) {
      return Alert.alert("경고", "올바른 정원 숫자를 입력해주세요.");
    }

    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    const dto: EditGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location?.trim(),
      dateTime: finalDate.toISOString(),
    };

    editMutation.mutate(dto);
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDateStr(day.dateString);
  };

  ////////////////////////////////////////////////////////

  // 내 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );

  // 1-1. 참여 신청
  const applyMutation = useMutation({
    mutationFn: async () => client.post(`/participant/apply/${id}`),
    onSuccess: async () => {
      Alert.alert("성공", "참여 신청이 완료되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "신청 실패"),
  });

  // 1-2. 참여 취소
  const cancelApplyMutation = useMutation({
    mutationFn: async () => client.delete(`/participant/cancel/${id}`),
    onSuccess: async () => {
      Alert.alert("성공", "참여 신청이 취소되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "취소 실패"),
  });

  // 2. 상태 변경: 참가자로 올리기 (APPROVED)
  const approveMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/approve`),
    onSuccess: async () => {
      Alert.alert("성공", "참가자로 승인되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "승인 실패"),
  });

  // 3. 상태 변경: 대기자로 내리기 (PENDING)
  const pendMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/pending`),
    onSuccess: async () => {
      Alert.alert("성공", "대기 상태로 변경되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "상태 변경 실패"),
  });

  // 4. 상태 변경: 강퇴 (BANNED)
  const banMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/ban`),
    onSuccess: async () => {
      Alert.alert("성공", "강퇴 처리되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "강퇴 실패"),
  });

  ////////////////////////////////////////////////////////

  const startMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/start`),
    onSuccess: async () => {
      Alert.alert("성공", "모임이 시작되었습니다! 🚀");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "시작 실패"),
  });

  const completeMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/complete`),
    onSuccess: async () => {
      Alert.alert("성공", "모임이 종료되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "종료 실패"),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/cancel`),
    onSuccess: async () => {
      Alert.alert("성공", "모임이 취소되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      Alert.alert("오류", err.response?.data?.message || "취소 실패"),
  });

  ////////////////////////////////////////////////////////

  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);

  const noShowMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await client.patch(`/participant/${participantId}/no-show`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    },
    onError: (err: any) => {
      Alert.alert("오류", err.response?.data?.message || "노쇼 처리 실패");
    },
  });

  const handleCompleteCheck = async () => {
    const restParticipants = (gathering?.participants || []).filter(
      (p) => p.status === "APPROVED",
    );

    try {
      // 미지정 참가자들을 YES_SHOW로 변경하는 API 요청
      if (restParticipants.length > 0) {
        await Promise.all(
          restParticipants.map((p) =>
            client.patch(`/participant/${p.id}/yes-show`),
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["gathering", id] });
      }

      setIsNoShowModalOpen(false);
      Alert.alert("완료", "참가자 출석 체크가 완료되었습니다.");
    } catch (error) {
      Alert.alert("오류", "출석 체크 처리 중 오류가 발생했습니다.");
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

  // DM 요청하기
  const requestDmMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await client.post(`/direct-chat/request/${targetUserId}`);
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
      // 차단 후 목록 갱신 등이 필요하면 추가 (예: invalidateQueries)
    },
    onError: (err: any) => {
      Alert.alert(
        "오류",
        err.response?.data?.message || "유저 차단에 실패했습니다.",
      );
    },
  });

  // 현재 말풍선 메뉴가 열려있는 유저 ID 관리
  const [activeMenuUserId, setActiveMenuUserId] = React.useState<string | null>(
    null,
  );

  // 액션 메뉴 외부 터치 시 메뉴 닫기 핸들러
  const handleCloseMenu = () => setActiveMenuUserId(null);

  ////////////////////////////////////////////////////////

  if (isLoading || !gathering) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </SafeAreaView>
    );
  }

  const approvedParticipants =
    gathering.participants?.filter(
      (p) => p.status === "APPROVED" || p.status === "YES_SHOW",
    ) || [];

  const pendingParticipants =
    gathering.participants?.filter((p) => p.status === "PENDING") || [];

  const currentCount = approvedParticipants.length;

  const myParticipant = gathering.participants?.find(
    (p) => p.userId === me?.id,
  );

  const renderUserCard = (
    user?: UserProfile,
    roleTag?: string,
    participantId?: string,
    currentStatus?: "APPROVED" | "PENDING",
  ) => {
    const isMe = String(user?.id) === String(me?.id);
    const isMenuOpen = activeMenuUserId === user?.id;

    const isUserHost = String(user?.id) === String(gathering?.hostId);
    const displayRoleTag = roleTag || (isUserHost ? "👑 방장" : undefined);

    return (
      <View style={[styles.userCard, { zIndex: isMenuOpen ? 999 : 1 }]}>
        <View style={styles.userInfoLeft}>
          <TouchableOpacity
            activeOpacity={isMe ? 1 : 0.5}
            onPress={() => {
              if (user && !isMe) {
                setActiveMenuUserId(isMenuOpen ? null : user.id);
              }
            }}
          >
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.text} />
              </View>
            )}
          </TouchableOpacity>

          {/* 💡 [핵심] 프로필 이미지 클릭 시 이미지 바로 오른쪽 옆에 뜨는 팝업 탭 */}
          {isMenuOpen && user && (
            <View style={styles.inlineTabPopover}>
              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  router.push(`/profile/${user.id}`);
                }}
              >
                <Text style={styles.popoverText}>프로필 보기</Text>
              </TouchableOpacity>

              <View style={styles.popoverDivider} />

              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  sendFriendRequestMutation.mutate(user.id);
                }}
              >
                <Text style={styles.popoverText}>친구 요청</Text>
              </TouchableOpacity>

              <View style={styles.popoverDivider} />

              <TouchableOpacity
                style={styles.popoverItem}
                onPress={() => {
                  handleCloseMenu();
                  requestDmMutation.mutate(user.id);
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
                    `${user.nickname}님을 차단하시겠습니까?`,
                    [
                      { text: "취소", style: "cancel" },
                      {
                        text: "차단",
                        style: "destructive",
                        onPress: () => blockUserMutation.mutate(user.id),
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

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.nickname}</Text>
              {displayRoleTag && (
                <Text style={styles.roleBadge}>{displayRoleTag}</Text>
              )}
            </View>
            <Text style={styles.statsText}>
              예스쇼 {user?.yesShowCount ?? 0}회{"  /  "}노쇼{" "}
              {user?.noShowCount ?? 0}회
            </Text>
          </View>

          {isHost &&
            !isUserHost &&
            participantId &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <View style={styles.actionBtnGroup}>
                {currentStatus === "APPROVED" && (
                  <TouchableOpacity
                    style={styles.btnPending}
                    onPress={() => pendMutation.mutate(participantId)}
                  >
                    <Ionicons
                      name="hourglass-outline"
                      size={16}
                      color={Colors.card}
                    />
                  </TouchableOpacity>
                )}

                {currentStatus === "PENDING" && (
                  <TouchableOpacity
                    style={styles.btnApprove}
                    onPress={() => approveMutation.mutate(participantId)}
                  >
                    <Ionicons
                      name="checkbox-outline"
                      size={16}
                      color={Colors.card}
                    />
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
                  <Ionicons
                    name="person-remove-outline"
                    size={16}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>
            )}
        </View>
      </View>
    );
  };

  const isApprovedParticipant = myParticipant?.status === "APPROVED";
  const canAccessChat = isHost || isApprovedParticipant;

  //////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>벙개 상세 정보</Text>

        <TouchableOpacity
          style={[styles.chatButton, styles.chatButtonActive]}
          activeOpacity={canAccessChat ? 0.7 : 1}
          onPress={() => {
            if (!canAccessChat) {
              return Alert.alert(
                "입장 불가",
                "승인된 참가자만 입장할 수 있습니다.",
              );
            }
            router.push(`/gathering/${id}/chat`);
          }}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={16}
            color={Colors.yellow}
          />
          <Text style={[styles.chatButtonText, { color: Colors.yellow }]}>
            채팅방
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.content}>
        {gathering.status === "COMPLETED" && (
          <View style={[styles.statusBanner, styles.completedBanner]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.orange}
              />
              <Text
                style={[styles.statusBannerText, styles.completedBannerText]}
              >
                종료된 모임입니다
              </Text>
            </View>
            {isHost &&
              (gathering.participants || []).some(
                (p) => p.status === "APPROVED",
              ) && (
                <TouchableOpacity
                  style={styles.noShowButton}
                  onPress={() => setIsNoShowModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="ban-outline" size={18} color={Colors.text} />
                  <Text style={styles.noShowButtonText}>노쇼 체크하기</Text>
                </TouchableOpacity>
              )}
          </View>
        )}

        {gathering.status === "CANCELED" && (
          <View style={[styles.statusBanner, styles.canceledBanner]}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={Colors.red}
            />
            <Text style={[styles.statusBannerText, styles.canceledBannerText]}>
              취소된 모임입니다
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    STATUS_COLOR[gathering.status]?.bg ||
                    "rgba(142, 142, 147, 0.15)",
                  color: STATUS_COLOR[gathering.status]?.text || "#8E8E93",
                },
              ]}
            >
              {STATUS_LABEL[gathering.status] || gathering.status}
            </Text>

            <Text style={styles.categoryText}>
              {CATEGORY_LABEL[gathering.category] || gathering.category}
            </Text>
          </View>
          {isHost &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={openEditModal}
              >
                <Ionicons name="pencil" size={14} color={Colors.text} />
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
            )}
        </View>

        <Text style={styles.title}>{gathering.title}</Text>
        <Text style={styles.description}>{gathering.description}</Text>

        <View style={{ marginTop: 20 }} />

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.yellow} />
            <Text style={styles.infoText}>
              {formatDateTime(gathering.dateTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.red} />
            <Text style={styles.infoText}>{gathering.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={Colors.yellow} />
            <Text style={styles.infoText}>
              참여 인원:{" "}
              <Text style={styles.highlightText}>{currentCount}</Text> /{" "}
              {gathering.maxPeople}명
            </Text>
          </View>
          {gathering.roomCode && (
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCodeLabel}> 룸 코드</Text>
              <Text style={styles.roomCodeText}>{gathering.roomCode}</Text>
            </View>
          )}

          {isHost &&
            !(
              gathering.status === "COMPLETED" ||
              gathering.status === "CANCELED"
            ) && (
              <View style={styles.hostBox}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <Ionicons
                    name="settings-outline"
                    size={16}
                    color={Colors.text}
                  />
                  <Text style={styles.sectionTitle}>모임 관리</Text>
                </View>

                <View style={styles.hostButtonGroup}>
                  {(gathering.status === "OPEN" ||
                    gathering.status === "FULL") && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.hostBtn,
                          { backgroundColor: Colors.yellow },
                        ]}
                        onPress={() =>
                          Alert.alert(
                            "모임 시작 🚀",
                            "정말로 모임을 시작하시겠습니까?",
                            [
                              { text: "아니오" },
                              {
                                text: "예",
                                onPress: () => startMutation.mutate(),
                              },
                            ],
                          )
                        }
                      >
                        <Text
                          style={[styles.hostBtnText, { color: Colors.card }]}
                        >
                          시작하기 🚀
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.hostBtn,
                          { backgroundColor: Colors.red },
                        ]}
                        onPress={() =>
                          Alert.alert(
                            "모임 취소 🗑️",
                            "정말로 모임을 취소하시겠습니까?",
                            [
                              { text: "아니오" },
                              {
                                text: "예",
                                onPress: () => cancelMutation.mutate(),
                              },
                            ],
                          )
                        }
                      >
                        <Text style={styles.hostBtnText}>취소하기 🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {gathering.status === "IN_PROGRESS" && (
                    <TouchableOpacity
                      style={[
                        styles.hostBtn,
                        { backgroundColor: Colors.orange },
                      ]}
                      onPress={() =>
                        Alert.alert(
                          "모임 종료 👋",
                          "정말로 모임을 종료하시겠습니까?",
                          [
                            { text: "아니오" },
                            {
                              text: "예",
                              onPress: () => completeMutation.mutate(),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.hostBtnText}>종료하기 👋 </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
        </View>

        <View style={styles.divider} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          {/* <Ionicons name="checkbox-outline" size={16} color={Colors.text} /> */}
          <Text style={styles.listSectionTitle}>✅ 참가자</Text>
        </View>
        {approvedParticipants.length === 0 ? (
          <Text style={styles.emptyText}>참가 승인된 멤버가 없습니다.</Text>
        ) : (
          approvedParticipants.map((p) => (
            <View key={p.id}>
              {renderUserCard(p.user, undefined, p.id, "APPROVED")}
            </View>
          ))
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          {/* <Ionicons name="hourglass-outline" size={16} color={Colors.text} /> */}
          <Text style={styles.listSectionTitle}>⏳ 대기자</Text>
        </View>
        {pendingParticipants.length === 0 ? (
          <Text style={styles.emptyText}>대기 중인 멤버가 없습니다.</Text>
        ) : (
          pendingParticipants.map((p) => (
            <View key={p.id}>
              {renderUserCard(p.user, undefined, p.id, "PENDING")}
            </View>
          ))
        )}

        {!isHost &&
          (gathering.status === "OPEN" || gathering.status === "FULL") && (
            <View style={{ marginTop: 24 }}>
              {myParticipant ? (
                <View style={{ gap: 8 }}>
                  {myParticipant.status !== "BANNED" && (
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: "#555" }]}
                      onPress={() =>
                        Alert.alert(
                          "참여 취소",
                          "정말 벙개 참여를 취소하시겠습니까?",
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
                        벙개 참여 취소하기
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => applyMutation.mutate()}
                >
                  <Text style={styles.applyButtonText}>
                    벙개 참여 신청하기 ⚡️
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
      </ScrollView>

      {/* 모임 수정 모달 */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>벙개 정보 수정</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>카테고리</Text>
              <View style={styles.categorySelectRow}>
                {[
                  { label: "술벙", value: GatheringCategory.DRINK },
                  { label: "클럽벙", value: GatheringCategory.CLUB },
                  { label: "술+클럽벙", value: GatheringCategory.DRINK_CLUB },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.modalCategoryChip,
                      category === item.value && styles.modalCategoryChipActive,
                    ]}
                    onPress={() => setCategory(item.value)}
                  >
                    <Text
                      style={[
                        styles.modalCategoryText,
                        category === item.value &&
                          styles.modalCategoryTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>모임 제목</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 종로 같이 술마실 분!"
                placeholderTextColor={Colors.tabIconDefault}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>상세 설명</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="예) 끼, 주사 없는 2030만"
                placeholderTextColor={Colors.tabIconDefault}
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>장소</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 종로3가역 6번 출구"
                placeholderTextColor={Colors.tabIconDefault}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.inputLabel}>모임 날짜 선택</Text>
              <Calendar
                current={selectedDateStr}
                minDate={getTodayString()}
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDateStr]: {
                    selected: true,
                    selectedColor: Colors.red,
                    selectedTextColor: "#FFFFFF",
                  },
                }}
                theme={{
                  backgroundColor: "#2C2C2E",
                  calendarBackground: "#2C2C2E",
                  textSectionTitleColor: Colors.tabIconDefault,
                  selectedDayBackgroundColor: Colors.red,
                  selectedDayTextColor: "#FFFFFF",
                  todayTextColor: Colors.yellow,
                  dayTextColor: "#FFFFFF",
                  textDisabledColor: "#48484A",
                  arrowColor: Colors.yellow,
                  monthTextColor: "#FFFFFF",
                  indicatorColor: Colors.yellow,
                  textDayFontWeight: "600",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "600",
                }}
                style={styles.inlineCalendar}
              />

              <Text style={styles.inputLabel}>모임 시간 선택</Text>
              <View style={styles.clockDisplayContainer}>
                <Text style={styles.clockDisplayText}>
                  {String(selectedHour).padStart(2, "0")} :{" "}
                  {String(selectedMinute).padStart(2, "0")}
                </Text>
              </View>

              <Text style={styles.subInputLabel}>시</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeChipScroll}
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.timeChip,
                      selectedHour === h && styles.timeChipActive,
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        selectedHour === h && styles.timeChipTextActive,
                      ]}
                    >
                      {String(h).padStart(2, "0")}시
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.subInputLabel}>분</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeChipScroll}
              >
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.timeChip,
                      selectedMinute === m && styles.timeChipActive,
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        selectedMinute === m && styles.timeChipTextActive,
                      ]}
                    >
                      {String(m).padStart(2, "0")}분
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>최대 인원 (명)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(maxPeople ?? "")}
                onChangeText={setMaxPeople}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEditGathering}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>수정하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 노쇼 체크하기 모달 */}
      <Modal
        visible={isNoShowModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNoShowModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>참가자 노쇼 체크</Text>
              <TouchableOpacity onPress={() => setIsNoShowModalOpen(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={(gathering.participants || []).filter(
                (item) =>
                  item.userId !== me?.id &&
                  (item.status === "APPROVED" ||
                    item.status === "YES_SHOW" ||
                    item.status === "NO_SHOW"),
              )}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.participantRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.participantName}>
                      {item.user?.nickname || "참가자"}
                    </Text>
                    {item.status === "NO_SHOW" && (
                      <Text style={styles.noShowBadge}>노쇼 처리됨</Text>
                    )}
                    {item.status === "YES_SHOW" && (
                      <Text style={styles.yesShowBadge}>예스쇼 처리됨</Text>
                    )}
                  </View>

                  {/* 방장 자신 제외 & 이미 노쇼가 아닌 유저만 버튼 표시 */}
                  {item.userId !== me?.id && item.status !== "NO_SHOW" && (
                    <TouchableOpacity
                      style={styles.noShowBtn}
                      onPress={() =>
                        Alert.alert(
                          "노쇼 처리",
                          `${item.user?.nickname} 님을 노쇼 처리하시겠습니까?`,
                          [
                            { text: "취소", style: "cancel" },
                            {
                              text: "확인",
                              style: "destructive",
                              onPress: () => noShowMutation.mutate(item.id),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.noShowBtnText}>노쇼 지정</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            {/* 🚀 하단 체크 완료 버튼 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleCompleteCheck}
                activeOpacity={0.8}
              >
                <Text style={styles.completeBtnText}>체크 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userCard: {
    // 상대 위치 기준점 잡기
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.card || "#FFF",
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    position: "relative", // 팝업 위치용
  },

  // 💡 프로필 이미지 바로 옆에 뜰 인라인 팝업 탭 스타일
  inlineTabPopover: {
    position: "absolute",
    left: 48, // 아바타 너비(40) + 여백
    top: -16,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // --- 추가할 채팅 버튼 스타일 ---
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // 아이콘과 텍스트 사이 간격
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20, // 둥근 알약 형태 버튼
    borderWidth: 1,
  },
  // 활성화(권한 있음) 상태 스타일
  chatButtonActive: {
    borderColor: Colors.yellow,
    backgroundColor: "rgba(255, 204, 0, 0.1)", // 은은한 노란색 배경 틴트
  },
  // 비활성화(권한 없음) 상태 스타일
  chatButtonDisabled: {
    borderColor: "#444",
    backgroundColor: "#222",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: -36,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  content: { padding: 16, paddingBottom: 50 },
  editIconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
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
  categoryText: { color: Colors.yellow, fontWeight: "bold", fontSize: 13 },
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
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
  hostButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  hostBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  hostBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { color: Colors.text, fontWeight: "bold", fontSize: 14 },
  roleBadge: {
    backgroundColor: Colors.yellow,
    color: Colors.card,
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statsText: {
    color: Colors.tabIconDefault,
    fontSize: 12,
    marginTop: 2,
  },
  actionBtnGroup: { flexDirection: "row", gap: 6 },
  btnPending: {
    backgroundColor: Colors.yellow,
    padding: 8,
    borderRadius: 6,
  },
  btnApprove: {
    backgroundColor: Colors.yellow,
    padding: 8,
    borderRadius: 6,
  },
  btnBan: {
    backgroundColor: Colors.red,
    padding: 8,
    borderRadius: 6,
  },
  emptyText: {
    color: Colors.tabIconDefault,
    fontSize: 13,
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: Colors.card,
    fontSize: 15,
    fontWeight: "bold",
  },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  completedBanner: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    justifyContent: "space-between",
  },
  completedBannerText: { color: Colors.orange },
  canceledBanner: { backgroundColor: "rgba(255, 59, 48, 0.15)" },
  canceledBannerText: { color: Colors.red },
  statusBannerText: { fontSize: 14, fontWeight: "bold" },

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
  input: {
    backgroundColor: "#2C2C2E",
    color: Colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
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
  modalCategoryChipActive: { backgroundColor: Colors.yellow },
  modalCategoryText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  modalCategoryTextActive: { color: Colors.card },
  inlineCalendar: { borderRadius: 8, overflow: "hidden" },
  clockDisplayContainer: {
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clockDisplayText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.yellow,
  },
  timeChipScroll: { flexDirection: "row" },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#2C2C2E",
    borderRadius: 6,
    marginRight: 6,
  },
  timeChipActive: { backgroundColor: Colors.yellow },
  timeChipText: { color: Colors.text, fontSize: 13 },
  timeChipTextActive: { color: Colors.card, fontWeight: "bold" },
  submitButton: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: { color: Colors.text, fontSize: 16, fontWeight: "bold" },
  noShowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.red,
    padding: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  noShowButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },

  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#2C2C2C",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantName: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  noShowBadge: {
    fontSize: 12,
    color: "#FF5252",
    backgroundColor: "#3A1E1E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  noShowBtn: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  noShowBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  yesShowBadge: {
    fontSize: 12,
    color: "#4CAF50",
    backgroundColor: "#1E3A2B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },

  // 모달 하단 버튼 영역
  modalFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#2A2A2A",
  },
  completeBtn: {
    backgroundColor: Colors.blue, // 강조 색상 (프로젝트 테마에 맞게 조정)
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  roomCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8, // statusRow와의 상하 간격
  },
  roomCodeLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  roomCodeText: {
    fontSize: 13,
    color: Colors.yellow, // 포인트 컬러 (노란색)
    fontWeight: "bold",
    backgroundColor: "#2C2C2E", // 약간 밝은 카드 배경
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    letterSpacing: 1, // 4자리 문자가 잘 보이도록 자간 조정
  },
});
