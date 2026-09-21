import { client } from "@/api/client";
import { saveTokenToServer } from "@/api/saveTokenToServer";
import Colors from "@/constants/Colors";
import { formatDateTime } from "@/utils/formatDateTime";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowList: true, // 알림 센터(드래그 내려서 보는 곳)에 표시
    shouldShowAlert: true, // 💡 배너 팝업 표시 여부
    shouldPlaySound: true, // 💡 소리 재생 여부
    shouldSetBadge: true,
  }),
});

export enum GatheringCategory {
  DRINK = "DRINK",
  CLUB = "CLUB",
  DRINK_CLUB = "DRINK_CLUB",
}

export interface Gathering {
  id: string;
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  status: string;
  createdAt: string;
  hostId: string;
  host: {
    profileImage: string;
  };
}

export interface CreateGatheringDto {
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  dateTime: string;
}

const CATEGORIES = [
  { label: "전체", value: "ALL" },
  { label: "술벙", value: GatheringCategory.DRINK },
  { label: "클럽벙", value: GatheringCategory.CLUB },
  { label: "술+클럽벙", value: GatheringCategory.DRINK_CLUB },
];

const fetchGatherings = async (): Promise<Gathering[]> => {
  const { data } = await client.get("/gathering");
  return data;
};

const createGathering = async (dto: CreateGatheringDto) => {
  const { data } = await client.post("/gathering", dto);
  return data;
};

const HOURS = [
  17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16,
];
const MINUTES = [0, 10, 20, 30, 40, 50];

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.DRINK,
  );
  const [maxPeople, setMaxPeople] = useState("8");
  const [location, setLocation] = useState("");

  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        saveTokenToServer(token);
      }
    });
  }, []);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  useEffect(() => {
    if (me && (!me.termsAgreedAt || !me.privacyAgreedAt)) {
      router.replace("/login");
    }
  }, [me]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const handleEnterRoom = async () => {
    const cleanCode = inviteCode.trim().toLowerCase();
    if (!cleanCode || cleanCode.length !== 4) {
      Alert.alert("알림", "4자리 룸코드를 올바르게 입력해 주세요.");
      return;
    }

    try {
      setIsInviteLoading(true);
      const response = await client.get(`/gathering/search/${cleanCode}`);
      const gatheringId = response.data.id;

      setInviteCode("");
      setIsInviteModalOpen(false);
      router.push(`/gathering/${gatheringId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "벙개를 찾을 수 없습니다.";
      Alert.alert("오류", message);
    } finally {
      setIsInviteLoading(false);
    }
  };

  const {
    data: gatherings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["gatherings"],
    queryFn: fetchGatherings,
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      Alert.alert("성공", "방이 생성되었습니다! ⚡️");
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "벙개 생성에 실패했습니다.";
      Alert.alert("오류", Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const filteredGatherings = gatherings.filter((item) => {
    const isNotCanceled = item.status !== "CANCELED";
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return isNotCanceled && matchesCategory;
  });

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setCategory(GatheringCategory.DRINK);
    setMaxPeople("8");
    setLocation("");
    setSelectedDateStr(new Date().toISOString().split("T")[0]);
    setSelectedHour(new Date().getHours());
    setSelectedMinute(0);
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDateStr(day.dateString);
  };

  const handleCreateGathering = () => {
    if (!title.trim()) return Alert.alert("경고", "제목을 입력해주세요.");
    if (!description.trim()) return Alert.alert("경고", "설명을 입력해주세요.");
    if (!location.trim())
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

    const dto: CreateGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location.trim(),
      dateTime: finalDate.toISOString(),
    };

    createMutation.mutate(dto);
  };

  const getCategoryLabel = (cat: GatheringCategory) => {
    switch (cat) {
      case GatheringCategory.DRINK:
        return "🍺 술벙";
      case GatheringCategory.CLUB:
        return Platform.OS === "ios" ? "🪩 클럽벙" : "🎉 클럽벙";
      case GatheringCategory.DRINK_CLUB:
        return "🔥 술+클럽벙";
      default:
        return cat;
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const STATUS_CONFIG: Record<
    string,
    { label: string; badgeStyle: any; textStyle: any }
  > = {
    OPEN: {
      label: "모집중",
      badgeStyle: styles.statusOpen,
      textStyle: styles.statusOpenText,
    },
    FULL: {
      label: "인원 마감",
      badgeStyle: styles.statusFull,
      textStyle: styles.statusFullText,
    },
    IN_PROGRESS: {
      label: "진행중",
      badgeStyle: styles.statusInProgress,
      textStyle: styles.statusInProgressText,
    },
    COMPLETED: {
      label: "종료됨",
      badgeStyle: styles.statusInCompleted,
      textStyle: styles.statusInCompletedText,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleHighlight}>⚡️</Text> 벙개의 광장
        </Text>

        <TouchableOpacity
          style={styles.roomSearchButton}
          activeOpacity={0.7}
          onPress={() => {
            setIsInviteModalOpen(true);
            setInviteCode("");
          }}
        >
          <Ionicons name="qr-code" size={20} color="#FFE600" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFE600" />
        </View>
      ) : (
        <FlatList
          data={filteredGatherings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.placeholderEmoji}>⚡️</Text>
              <Text style={styles.placeholderText}>
                등록된 벙개가 없어요{"\n"}지금 첫 벙개를 만들어보세요!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/gathering/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeftGroup}>
                  <View
                    style={[
                      styles.statusBadge,
                      STATUS_CONFIG[item.status]?.badgeStyle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        STATUS_CONFIG[item.status]?.textStyle,
                      ]}
                    >
                      {STATUS_CONFIG[item.status]?.label || item.status}
                    </Text>
                  </View>
                  <Text style={styles.cardCategory}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>

                <View style={styles.peopleBadge}>
                  <Ionicons name="people-outline" size={13} color="#A1A1AA" />
                  <Text style={styles.cardPeople}>{item.maxPeople}명</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.infoGroup}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={14} color="#FFE600" />
                    <Text style={styles.cardInfoText}>
                      {formatDateTime(item.dateTime)}
                    </Text>
                  </View>

                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#FF453A"
                    />
                    <Text style={styles.cardInfoText}>{item.location}</Text>
                  </View>
                </View>

                <View style={styles.hostContainer}>
                  {item.host?.profileImage ? (
                    <Image
                      source={{ uri: item.host.profileImage }}
                      style={styles.hostImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={18} color="#A1A1AA" />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#000000" />
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAndResetModal}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -32}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New 벙개 만들기</Text>
                <TouchableOpacity
                  onPress={closeAndResetModal}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.inputLabel}>카테고리</Text>
                <View style={styles.categorySelectRow}>
                  {[
                    { label: "🍺 술벙", value: GatheringCategory.DRINK },
                    {
                      label: Platform.OS === "ios" ? "🪩 클럽벙" : "🎉 클럽벙",
                      value: GatheringCategory.CLUB,
                    },
                    {
                      label: "🔥 술+클럽벙",
                      value: GatheringCategory.DRINK_CLUB,
                    },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.modalCategoryChip,
                        category === item.value &&
                          styles.modalCategoryChipActive,
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
                  placeholderTextColor="#666668"
                  multiline
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>상세 설명</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="예) 끼, 주사 없는 2030만 편하게 모여요"
                  placeholderTextColor="#666668"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.inputLabel}>장소</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예) 종로3가역 6번 출구 앞"
                  placeholderTextColor="#666668"
                  multiline
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.inputLabel}>모임 날짜</Text>
                <Calendar
                  current={selectedDateStr}
                  minDate={getTodayString()}
                  onDayPress={handleDayPress}
                  markedDates={{
                    [selectedDateStr]: {
                      selected: true,
                      selectedColor: "#FFE600",
                      selectedTextColor: "#000000",
                    },
                  }}
                  theme={{
                    backgroundColor: "#18181B",
                    calendarBackground: "#18181B",
                    textSectionTitleColor: "#71717A",
                    selectedDayBackgroundColor: "#FFE600",
                    selectedDayTextColor: "#000000",
                    todayTextColor: "#FFE600",
                    dayTextColor: "#FFFFFF",
                    textDisabledColor: "#3F3F46",
                    arrowColor: "#FFE600",
                    monthTextColor: "#FFFFFF",
                    textDayFontWeight: "600",
                    textMonthFontWeight: "bold",
                  }}
                  style={styles.inlineCalendar}
                />

                <Text style={styles.inputLabel}>모임 시간</Text>
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
                  value={maxPeople}
                  onChangeText={setMaxPeople}
                />
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateGathering}
                disabled={createMutation.isPending}
                activeOpacity={0.8}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitButtonText}>방 만들기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isInviteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setInviteCode("");
          setIsInviteModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
          style={{ flex: 1 }}
        >
          <View style={styles.inviteModalOverlay}>
            <View style={styles.inviteModalContainer}>
              <Text style={styles.inviteModalTitle}>🔡 룸 코드 입장</Text>
              <Text style={styles.inviteModalSubTitle}>
                공유받은 4자리 코드를 입력하세요.
              </Text>

              <TextInput
                style={styles.codeInput}
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toLowerCase())}
                placeholder="____"
                placeholderTextColor="#52525B"
                maxLength={4}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => {
                    setInviteCode("");
                    setIsInviteModalOpen(false);
                  }}
                >
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={handleEnterRoom}
                  disabled={isInviteLoading}
                >
                  <Text style={styles.submitBtnText}>
                    {isInviteLoading ? "확인중..." : "입장하기"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
    paddingBottom: -50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: Platform.OS === "ios" ? "900" : "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerTitleHighlight: {
    fontSize: 20,
  },
  roomSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  roomSearchText: {
    color: "#FFE600",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#18181B",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  categoryChipActive: {
    backgroundColor: "#FFE600",
    borderColor: "#FFE600",
  },
  categoryText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: "#71717A",
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: Platform.OS === "ios" ? "700" : "600",
    color: Colors.yellow,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  statusOpen: {
    backgroundColor: Colors.blue,
  },
  statusOpenText: {
    color: "white",
  },
  statusFull: {
    backgroundColor: "#fb2c36",
  },
  statusFullText: {
    color: "white",
  },
  statusInProgress: {
    backgroundColor: "#fb2c36",
  },
  statusInProgressText: {
    color: "white",
  },
  statusInCompleted: {
    backgroundColor: "#364153",
  },
  statusInCompletedText: {
    color: "white",
  },
  peopleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#27272A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cardPeople: {
    fontSize: 11,
    color: "#D4D4D8",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
    color: "#f3f4f6",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: "#A1A1AA",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  infoGroup: {
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardInfoText: {
    fontSize: 12,
    color: "#D4D4D8",
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  hostContainer: {
    justifyContent: "flex-end",
  },
  hostImage: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE600",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFE600",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#18181B",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "88%",
    marginBottom: Platform.OS === "ios" ? 0 : 20,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A1A1AA",
    marginTop: 16,
    marginBottom: 8,
  },
  subInputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717A",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#27272A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  categorySelectRow: {
    flexDirection: "row",
    gap: 8,
  },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#27272A",
    alignItems: "center",
  },
  modalCategoryChipActive: {
    backgroundColor: "#FFE600",
  },
  modalCategoryText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "700",
  },
  modalCategoryTextActive: {
    color: "#000000",
    fontWeight: "800",
  },

  inlineCalendar: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 8,
  },

  clockDisplayContainer: {
    backgroundColor: "#27272A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFE600",
  },
  clockDisplayText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFE600",
    letterSpacing: 2,
  },
  timeChipScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#27272A",
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: "#FFE600",
  },
  timeChipText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timeChipTextActive: {
    color: "#000000",
    fontWeight: "800",
  },

  submitButton: {
    backgroundColor: "#FFE600",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  inviteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  inviteModalContainer: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#18181B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  inviteModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  inviteModalSubTitle: {
    fontSize: 13,
    color: "#A1A1AA",
    marginBottom: 20,
    textAlign: "center",
  },
  codeInput: {
    width: "100%",
    height: 52,
    backgroundColor: "#27272A",
    borderRadius: 12,
    color: "#FFE600",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#27272A",
  },
  cancelBtnText: {
    color: "#A1A1AA",
    fontWeight: "700",
  },
  submitBtn: {
    backgroundColor: "#FFE600",
  },
  submitBtnText: {
    color: "#000000",
    fontWeight: "800",
  },
});
