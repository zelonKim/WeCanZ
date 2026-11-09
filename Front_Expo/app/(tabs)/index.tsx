import { client } from "@/api/client";
import { createGathering } from "@/api/gathering/createGathering";
import { getGatherings } from "@/api/gathering/getGatherings";
import { searchGatheringByCode } from "@/api/gathering/searchGatheringByCode";
import { saveTokenToServer } from "@/api/user/saveTokenToServer";
import { CreateGatheringModal } from "@/components/CreateGatheringModal";
import { InviteCodeModal } from "@/components/InviteCodeModal";
import { MeetupItem } from "@/components/MeetupItem";
import { CATEGORIES } from "@/constants/CATEGORIES";
import Colors from "@/constants/Colors";
import { useHomeLanguage } from "@/hooks/useHomeLanguage";
import { CreateGatheringDto } from "@/types/gathering/CreateGatheringDto";
import { Gathering } from "@/types/gathering/Gathering";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowBanner: true,
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowList: true,
    }),
});

export default function HomeScreen() {
  const { t, currentLang } = useHomeLanguage();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.US,
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

  const handleChangeCode = (text: string) => {
    setInviteCode(text.toLowerCase());
  };

  const handleCloseInviteModal = () => {
    setInviteCode("");
    setIsInviteModalOpen(false);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        saveTokenToServer(token);
      }
    });
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////

  const {
    data: gatherings = [],
    isLoading,
    refetch,
  } = useQuery<Gathering[]>({
    queryKey: ["gatherings"],
    queryFn: getGatherings,
    refetchInterval: 15000,
  });

  const filteredGatherings = gatherings.filter((item) => {
    const isNotCanceled = item.status !== "CANCELED";
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return isNotCanceled && matchesCategory;
  });

  ////////////////////////////////////////////////////////////////////////////////////

  const { mutate: joinGatheringMutation } = useMutation({
    mutationFn: searchGatheringByCode,
    onSuccess: (data) => {
      const gatheringId = data.id;
      setInviteCode("");
      setIsInviteModalOpen(false);
      router.push(`/gathering/${gatheringId}`);
    },
    onError: (error: any) => {
      Alert.alert(t.error, t.alerts.roomNotFound);
    },
  });

  const handleEnterRoom = () => {
    const cleanCode = inviteCode.trim().toLowerCase();
    if (!cleanCode || cleanCode.length !== 4) {
      Alert.alert("알림", t.alerts.roomCodeLength);
      return;
    }

    joinGatheringMutation(cleanCode);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const { mutate: createGatheringMutation, isPending: createGatheringPending } =
    useMutation({
      mutationFn: createGathering,
      onSuccess: () => {
        Alert.alert(t.alerts.successCreate);
        queryClient.invalidateQueries({ queryKey: ["gatherings"] });
        closeAndResetModal();
      },
      onError: (error: any) => {
        const msg = error.response?.data?.message || t.alerts.failCreate;
        Alert.alert(Array.isArray(msg) ? msg[0] : msg);
      },
    });

  ////////////////////////////////////////////////////////////////////////////////////

  const handleCreateGathering = () => {
    if (!title.trim())
      return Alert.alert(t.alerts.title, t.alerts.titleRequired);
    if (!description.trim())
      return Alert.alert(t.alerts.title, t.alerts.descRequired);
    if (!location.trim())
      return Alert.alert(t.alerts.title, t.alerts.locationRequired);
    if (!maxPeople || isNaN(Number(maxPeople))) {
      return Alert.alert(t.alerts.title, t.alerts.invalidPeople);
    }
    if (Number(maxPeople) < 2) {
      return Alert.alert(t.alerts.title, t.alerts.minPeople);
    }
    if (Number(maxPeople) > 20) {
      return Alert.alert(t.alerts.title, t.alerts.maxPeople);
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

    createGatheringMutation(dto);
  };

  ////////////////////////////////////////////////////////////////////////////////////

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
          {CATEGORIES(t).map((cat) => {
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
          renderItem={({ item }) => MeetupItem(item, t, currentLang)}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.placeholderEmoji}></Text>
              <Text style={styles.placeholderText}>{t.emptyText}</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#000000" />
      </TouchableOpacity>

      <CreateGatheringModal
        isModalOpen={isModalOpen}
        closeAndResetModal={closeAndResetModal}
        category={category}
        setCategory={setCategory}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        selectedDateStr={selectedDateStr}
        handleDayPress={(day: any) => setSelectedDateStr(day.dateString)}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        selectedMinute={selectedMinute}
        setSelectedMinute={setSelectedMinute}
        maxPeople={maxPeople}
        setMaxPeople={setMaxPeople}
        createGatheringPending={createGatheringPending}
        handleCreateGathering={handleCreateGathering}
        t={t}
        styles={styles}
      />

      <InviteCodeModal
        visible={isInviteModalOpen}
        inviteCode={inviteCode}
        onChangeCode={handleChangeCode}
        onClose={handleCloseInviteModal}
        onSubmit={handleEnterRoom}
        isLoading={isInviteLoading}
        t={t}
        styles={styles}
      />
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////////////////

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
