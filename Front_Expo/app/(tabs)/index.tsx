import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { formatDateTime } from "@/utils/formatDateTime";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

  // 메인 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 폼 입력 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.DRINK,
  );
  const [maxPeople, setMaxPeople] = useState("8");
  const [location, setLocation] = useState("");

  // 인라인 날짜/시간 선택 상태
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  // 모임 목록 Query
  const {
    data: gatherings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["gatherings"],
    queryFn: fetchGatherings,
  });

  // 모임 생성 Mutation
  const createMutation = useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      Alert.alert("성공", "모임이 생성되었습니다! 🎉");
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "모임 생성에 실패했습니다.";
      Alert.alert("오류", Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const filteredGatherings = gatherings.filter((item) => {
    // 1. 상태 조건: OPEN 또는 FULL 상태인 모임만 노출
    const isOpenOrFull = item.status === "OPEN" || item.status === "FULL";

    // 2. 카테고리 조건
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return isOpenOrFull && matchesCategory;
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

    // 최종 선택한 날짜 + 시간 ISO 생성
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
        return Platform.OS === "ios" ? "🪩 클럽벙" : "💃 클럽벙";
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👋 벙개의 광장</Text>
      </View>

      {/* 카테고리 필터 바 */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                selectedCategory === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.value && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 모임 리스트 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.yellow} />
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
              <Text style={styles.placeholderText}>
                등록된 모임이 없습니다. 첫 모임을 열어보세요!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/gathering/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                {/* 뱃지 + 카테고리 묶음 */}
                <View style={styles.headerLeftGroup}>
                  {/* 상태 뱃지 */}
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "OPEN"
                        ? styles.statusOpen
                        : styles.statusFull,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === "OPEN"
                          ? styles.statusOpenText
                          : styles.statusFullText,
                      ]}
                    >
                      {item.status === "OPEN" ? "모집중" : "인원 마감"}
                    </Text>
                  </View>

                  <Text style={styles.cardCategory}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>

                <Text style={styles.cardPeople}>정원 {item.maxPeople}명</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={Colors.yellow}
                />
                <Text style={styles.cardInfoText}>
                  {formatDateTime(item.dateTime)}
                </Text>
              </View>

              <View style={[styles.infoRow, { marginTop: 4 }]}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={Colors.red}
                />
                <Text style={styles.cardInfoText}>{item.location}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB (플로팅 버튼) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* 새 벙개 만들기 단일 모달 */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAndResetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새 벙개 만들기</Text>
              <TouchableOpacity onPress={closeAndResetModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* 카테고리 */}
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

              {/* 제목 */}
              <Text style={styles.inputLabel}>모임 제목</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 종로 같이 술마실 분!"
                placeholderTextColor={Colors.tabIconDefault}
                value={title}
                onChangeText={setTitle}
              />

              {/* 설명 */}
              <Text style={styles.inputLabel}>상세 설명</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="예) 끼, 주사 없는 2030만"
                placeholderTextColor={Colors.tabIconDefault}
                multiline
                value={description}
                onChangeText={setDescription}
              />

              {/* 장소 */}
              <Text style={styles.inputLabel}>장소</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 종로3가역 6번 출구"
                placeholderTextColor={Colors.tabIconDefault}
                value={location}
                onChangeText={setLocation}
              />

              {/* 1. 인라인 날짜 선택 (캘린더) */}
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

              {/* 2. 인라인 시간 선택 (시/분 칩) */}
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

              {/* 최대 인원 */}
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
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>방 만들기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardCategory: { fontSize: 13, fontWeight: "bold", color: Colors.text },

  /* 뱃지 스타일 */
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  // 모집중 (초록 톤)
  statusOpen: {
    backgroundColor: Colors.green,
  },
  statusOpenText: {
    color: Colors.text,
  },
  // 인원 마감 (주황 톤)
  statusFull: {
    backgroundColor: Colors.red,
  },
  statusFullText: {
    color: Colors.text,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text },

  categoryContainer: { paddingHorizontal: 16, marginBottom: 20 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: Colors.yellow },
  categoryText: {
    fontSize: 14,
    color: Colors.tabIconDefault,
    fontWeight: "600",
  },
  categoryTextActive: { color: "#000", fontWeight: "bold" },

  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  placeholderText: { fontSize: 15, color: Colors.tabIconDefault },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardPeople: { fontSize: 12, color: Colors.tabIconDefault },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.tabIconDefault,
    lineHeight: 20,
    marginBottom: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardInfoText: { fontSize: 13, color: Colors.text },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },

  /* 메인 모달 단일 레이아웃 */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
    borderTopWidth: 1,
    borderColor: Colors.border,
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
    fontSize: 13,
    fontWeight: "600",
    color: Colors.tabIconDefault,
    marginTop: 14,
    marginBottom: 8,
  },
  subInputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.tabIconDefault,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { height: 70, textAlignVertical: "top" },

  categorySelectRow: { flexDirection: "row", gap: 12 },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
  },
  modalCategoryChipActive: { backgroundColor: Colors.yellow },
  modalCategoryText: {
    fontSize: 13,
    color: Colors.tabIconDefault,
    fontWeight: "600",
  },
  modalCategoryTextActive: { color: "#000", fontWeight: "bold" },

  /* 인라인 캘린더 */
  inlineCalendar: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },

  /* 인라인 시간 셀렉터 */
  clockDisplayContainer: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.yellow,
  },
  clockDisplayText: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.yellow,
    letterSpacing: 2,
  },
  timeChipScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: Colors.red,
  },
  timeChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600",
  },
  timeChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  submitButton: {
    backgroundColor: Colors.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});
