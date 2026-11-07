import { client } from "@/api/client";
import { saveTokenToServer } from "@/api/saveTokenToServer";
import Colors from "@/constants/Colors";
import { useHomeLanguage } from "@/hooks/useHomeLanguage";
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
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export enum GatheringCategory {
  US = "US",
  UK = "UK",
  KR = "KR",
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

const fetchGatherings = async (): Promise<Gathering[]> => {
  const { data } = await client.get("/gathering");
  return data;
};

const createGathering = async (dto: CreateGatheringDto) => {
  const { data } = await client.post("/gathering", dto);
  return data;
};

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTES = [0, 10, 20, 30, 40, 50];

export default function HomeScreen() {
  const { t, currentLang } = useHomeLanguage();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.KR,
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

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const CATEGORIES = [
    { label: t.all, value: "ALL" },
    { label: t.us, value: GatheringCategory.US },
    { label: t.uk, value: GatheringCategory.UK },
    { label: t.kr, value: GatheringCategory.KR },
  ];

  const STATUS_CONFIG: Record<
    string,
    { label: string; badgeStyle: any; textStyle: any }
  > = {
    OPEN: {
      label: t.statusOpen,
      badgeStyle: styles.statusOpen,
      textStyle: styles.statusOpenText,
    },
    FULL: {
      label: t.statusFull,
      badgeStyle: styles.statusFull,
      textStyle: styles.statusFullText,
    },
    IN_PROGRESS: {
      label: t.statusInProgress,
      badgeStyle: styles.statusInProgress,
      textStyle: styles.statusInProgressText,
    },
    COMPLETED: {
      label: t.statusCompleted,
      badgeStyle: styles.statusInCompleted,
      textStyle: styles.statusInCompletedText,
    },
  };

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

  const handleEnterRoom = async () => {
    const cleanCode = inviteCode.trim().toLowerCase();
    if (!cleanCode || cleanCode.length !== 4) {
      Alert.alert("알림", t.alerts.roomCodeLength);
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
      const message = error.response?.data?.message || t.alerts.roomNotFound;
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
      Alert.alert("성공", t.alerts.successCreate);
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t.alerts.failCreate;
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
    setCategory(GatheringCategory.KR);
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
    if (!title.trim()) return Alert.alert("경고", t.alerts.titleRequired);
    if (!description.trim()) return Alert.alert("경고", t.alerts.descRequired);
    if (!location.trim()) return Alert.alert("경고", t.alerts.locationRequired);
    if (!maxPeople || isNaN(Number(maxPeople))) {
      return Alert.alert("경고", t.alerts.invalidPeople);
    }
    if (Number(maxPeople) < 2) {
      return Alert.alert("경고", t.alerts.minPeople);
    }
    if (Number(maxPeople) > 20) {
      return Alert.alert("경고", t.alerts.maxPeople);
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
      case GatheringCategory.US:
        return t.us;
      case GatheringCategory.UK:
        return t.uk;
      case GatheringCategory.KR:
        return t.kr;
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>

        <TouchableOpacity
          style={styles.roomSearchButton}
          activeOpacity={0.7}
          onPress={() => {
            setIsInviteModalOpen(true);
            setInviteCode("");
          }}
        >
          <Ionicons name="qr-code" size={20} color={Colors.green} />
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
          <ActivityIndicator size="large" color={Colors.green} />
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
              <Text style={styles.placeholderEmoji}></Text>
              <Text style={styles.placeholderText}>{t.emptyText}</Text>
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
                  <Text style={styles.cardPeople}>
                    {item.maxPeople}
                    {t.people}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.infoGroup}>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.green}
                    />
                    <Text style={styles.cardInfoText}>
                      {formatDateTime(item.dateTime, currentLang)}
                    </Text>
                  </View>

                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={Colors.emerald}
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
          keyboardVerticalOffset={Platform.OS === "ios" ? -12 : -32}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.newMeetup}</Text>
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
                <Text style={styles.inputLabel}>{t.categoryLabel}</Text>
                <View style={styles.categorySelectRow}>
                  {[
                    { label: t.us, value: GatheringCategory.US },
                    { label: t.uk, value: GatheringCategory.UK },
                    { label: t.kr, value: GatheringCategory.KR },
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

                <Text style={styles.inputLabel}>{t.titleLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.titlePlaceholder}
                  placeholderTextColor="#666668"
                  multiline
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>{t.descLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t.descPlaceholder}
                  placeholderTextColor="#666668"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.inputLabel}>{t.locationLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.locationPlaceholder}
                  placeholderTextColor="#666668"
                  multiline
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.inputLabel}>{t.dateLabel}</Text>
                <Calendar
                  current={selectedDateStr}
                  minDate={getTodayString()}
                  onDayPress={handleDayPress}
                  markedDates={{
                    [selectedDateStr]: {
                      selected: true,
                      selectedColor: Colors.green,
                      selectedTextColor: "#000000",
                    },
                  }}
                  theme={{
                    backgroundColor: "#18181B",
                    calendarBackground: "#18181B",
                    textSectionTitleColor: "#71717A",
                    selectedDayBackgroundColor: Colors.green,
                    selectedDayTextColor: "#000000",
                    todayTextColor: Colors.green,
                    dayTextColor: "#FFFFFF",
                    textDisabledColor: "#3F3F46",
                    arrowColor: Colors.green,
                    monthTextColor: "#FFFFFF",
                    textDayFontWeight: "600",
                    textMonthFontWeight: "bold",
                  }}
                  style={styles.inlineCalendar}
                />

                <Text style={styles.inputLabel}>{t.timeLabel}</Text>
                <View style={styles.clockDisplayContainer}>
                  <Text style={styles.clockDisplayText}>
                    {String(selectedHour).padStart(2, "0")} :{" "}
                    {String(selectedMinute).padStart(2, "0")}
                  </Text>
                </View>

                <Text style={styles.subInputLabel}>{t.hourLabel}</Text>
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
                        {String(h).padStart(2, "0")}
                        {t.hourLabel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.subInputLabel}>{t.minuteLabel}</Text>
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
                        {String(m).padStart(2, "0")}
                        {t.minuteLabel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>{t.maxPeopleLabel}</Text>
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
                  <Text style={styles.submitButtonText}>{t.createBtn}</Text>
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
              <Text style={styles.inviteModalTitle}>{t.roomCodeTitle}</Text>
              <Text style={styles.inviteModalSubTitle}>{t.roomCodeSub}</Text>

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
                  <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.submitBtn]}
                  onPress={handleEnterRoom}
                  disabled={isInviteLoading}
                >
                  <Text style={styles.submitBtnText}>
                    {isInviteLoading ? t.checking : t.enter}
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
    fontSize: 24,
    fontWeight: "800",
    color: Colors.green,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },

  roomSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  roomSearchText: {
    color: Colors.green,
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
    backgroundColor: Colors.green,
    borderColor: Colors.green,
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
    paddingVertical: 120,
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
    color: Colors.gray,
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
    backgroundColor: Colors.green,
  },
  statusOpenText: {
    color: Colors.background,
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
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.green,
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
    backgroundColor: Colors.green,
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
    borderColor: Colors.green,
  },
  clockDisplayText: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.green,
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
    backgroundColor: Colors.green,
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
    backgroundColor: Colors.green,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
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
    color: Colors.green,
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
    backgroundColor: Colors.green,
  },
  submitBtnText: {
    color: "#000000",
    fontWeight: "800",
  },
});
