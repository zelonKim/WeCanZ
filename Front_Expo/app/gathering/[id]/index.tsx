import { client } from "@/api/client";
import { GatheringModal } from "@/components/GatheringModal";
import { GatheringUserCard } from "@/components/GatheringUserCard";
import { NoShowModal } from "@/components/NoShowModal";
import { ReportModal } from "@/components/ReportModal";
import Colors from "@/constants/Colors";
import { STATUS_COLOR } from "@/constants/STATUS_COLOR";
import { useRequestDmMutation } from "@/hooks/DM/useRequestDmMutation";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useSendFriendRequestMutation } from "@/hooks/friend/useSendFriendRequestMutation";
import { useApplyGatheringMutation } from "@/hooks/gathering/useApplyGatheringMutation";
import { useApproveParticipantMutation } from "@/hooks/gathering/useApproveParticipantMutation";
import { useBanParticipantMutation } from "@/hooks/gathering/useBanParticipantMutation";
import { useCancelApplyGatheringMutation } from "@/hooks/gathering/useCancelApplyGatheringMutation";
import { useCancelGatheringMutation } from "@/hooks/gathering/useCancelGatheringMutation";
import { useCompleteGatheringMutation } from "@/hooks/gathering/useCompleteGatheringMutation";
import { useEditGatheringMutation } from "@/hooks/gathering/useEditGatheringMutation";
import { useNoShowParticipantMutation } from "@/hooks/gathering/useNoShowParticipantMutation";
import { usePendingParticipantMutation } from "@/hooks/gathering/usePendingParticipantMutation";
import { useStartGatheringMutation } from "@/hooks/gathering/useStartGatheringMutation";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useCreateReportMutation } from "@/hooks/user/useCreateReportMutation";
import { EditGatheringDto } from "@/types/gathering/EditGatheringDto";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
import { GatheringDetail } from "@/types/gathering/GatheringDetail";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { ReportReason } from "@/types/user/ReportReason";
import { formatDateTime } from "@/utils/formatDateTime";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GatheringDetailScreen() {
  const { t, currentLang } = useGatheringDetailLanguage();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = React.useState<string | null>(
    null,
  );
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.US,
  );
  const [maxPeople, setMaxPeople] = useState<number | string>("");
  const [location, setLocation] = useState<string>("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const handleDayPress = (day: DateData) => {
    setSelectedDateStr(day.dateString);
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////////////

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCloseMenu = () => setActiveMenuUserId(null);

  ////////////////////////////////////////////////////////////////////////////////////////////

  const refreshGathering = () => {
    queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    queryClient.invalidateQueries({ queryKey: ["my-gatherings"] });
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const {
    data: gathering,
    isPending,
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

  ////////////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////

  const { mutate: editGatheringMutate, isPending: editGatheringPending } =
    useEditGatheringMutation(async () => {
      await gatheringRefetch();
      refreshGathering();
      closeEditModal();
    });

  const handleEditGathering = () => {
    if (!title?.trim())
      return Alert.alert(t.alerts.warning, t.alerts.emptyTitle);
    if (!description?.trim())
      return Alert.alert(t.alerts.warning, t.alerts.emptyDescription);
    if (!location?.trim())
      return Alert.alert(t.alerts.warning, t.alerts.emptyLocation);

    if (!maxPeople || isNaN(Number(maxPeople))) {
      return Alert.alert(t.alerts.warning, t.alerts.invalidMaxPeople);
    }

    const [year, month, day] = selectedDateStr.split("-").map(Number);

    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    const editGatheringPayload: EditGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location?.trim(),
      dateTime: finalDate.toISOString(),
    };

    editGatheringMutate({ id, editGatheringPayload });
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: applyMutate } = useApplyGatheringMutation(id, async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: cancelApplyMutate } = useCancelApplyGatheringMutation(
    id,
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: approveMutate } = useApproveParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });
  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: pendingMutate } = usePendingParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: banMutate } = useBanParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: startGatheringMutate } = useStartGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: completeGatheringMutate } = useCompleteGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: cancelGatheringMutate } = useCancelGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleCompleteCheck = async () => {
    const restParticipants = (gathering?.participants || []).filter(
      (p) => p.status === "APPROVED",
    );

    try {
      if (restParticipants.length > 0) {
        await Promise.all(
          restParticipants.map((p) =>
            client.patch(`/participant/${p.id}/yes-show`),
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["gathering", id] });
      }

      setIsNoShowModalOpen(false);
      Alert.alert(t.alerts.success, t.alerts.completeCheckSuccess);
    } catch (error) {
      Alert.alert(t.alerts.error, t.alerts.completeCheckFail);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: createReportMutate } = useCreateReportMutation(
    () => {
      setIsReportModalOpen(false);
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    () => {
      setIsSubmittingReport(false);
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      Alert.alert(t.alerts.warning, t.reportDetailsPlaceholder);
      return;
    }
    setIsSubmittingReport(true);
    try {
      const createReportPayload: CreateReportDto = {
        reportedUserId: gathering!.hostId,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutate(createReportPayload);
    } catch (error: any) {
      Alert.alert(t.alerts.error, t.alerts.userNotFound);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: blockUserMutate } = useBlockUserMutation();

  const { mutate: sendFriendRequestMutate } = useSendFriendRequestMutation();

  const { mutate: requestDmMutate } = useRequestDmMutation();

  const { mutate: noShowMutate } = useNoShowParticipantMutation(id);

  ////////////////////////////////////////////////////////////////////////////////////////////

  if (isPending || !gathering) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }
  ////////////////////////////////////////////////////////////////////////////////////////////

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

  const isApprovedParticipant = myParticipant?.status === "APPROVED";
  const canAccessChat = isHost || isApprovedParticipant;

  ///////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>

        <TouchableOpacity
          style={[styles.chatButton, styles.chatButtonActive]}
          activeOpacity={canAccessChat ? 0.7 : 1}
          onPress={() => {
            if (!canAccessChat) {
              return Alert.alert(
                t.alerts.accessDeniedTitle,
                t.alerts.accessDeniedMsg,
              );
            }
            router.push(`/gathering/${id}/chat`);
          }}
        >
          <Ionicons name="chatbubbles-outline" size={16} color={Colors.green} />
          <Text style={[styles.chatButtonText, { color: Colors.green }]}>
            {t.chatButton}
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
                {t.completedBanner}
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
                  <Text style={styles.noShowButtonText}>{t.checkNoShow}</Text>
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
              {t.canceledBanner}
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
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
              {t.statusLabels[gathering.status] || gathering.status}
            </Text>

            <Text style={styles.categoryText}>
              {t.categoryLabels[gathering.category] || gathering.category}
            </Text>
          </View>

          {isHost &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={openEditModal}
              >
                <Ionicons name="pencil" size={14} color={Colors.text} />
                <Text style={styles.editButtonText}>{t.edit}</Text>
              </TouchableOpacity>
            )}
          {!isHost && (
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setIsReportModalOpen(true)}
            >
              <Ionicons name="warning-outline" size={15} color="#FF453A" />
              <Text style={[styles.editButtonText, { color: "#FF453A" }]}>
                {t.report}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>{gathering.title}</Text>
        <Text style={styles.description}>{gathering.description}</Text>

        <View style={{ marginTop: 20 }} />

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.green} />
            <Text style={styles.infoText}>
              {formatDateTime(gathering.dateTime, currentLang)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Colors.emerald}
            />
            <Text style={styles.infoText}>{gathering.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color={Colors.green} />
            <Text style={styles.infoText}>
              {t.participantCount}{" "}
              <Text style={styles.highlightText}>{currentCount}</Text> /{" "}
              {gathering.maxPeople}
              {t.peopleUnit}
            </Text>
          </View>
          {gathering.roomCode && (
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCodeLabel}> {t.roomCode}</Text>
              <Text style={styles.roomCodeText}>{gathering.roomCode}</Text>
            </View>
          )}
        </View>
        {isHost &&
          !(
            gathering.status === "COMPLETED" || gathering.status === "CANCELED"
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
                <Text style={styles.sectionTitle}>{t.management}</Text>
              </View>

              <View style={styles.hostButtonGroup}>
                {(gathering.status === "OPEN" ||
                  gathering.status === "FULL") && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.hostBtn,
                        { backgroundColor: Colors.green },
                      ]}
                      onPress={() =>
                        Alert.alert(t.alerts.startTitle, t.alerts.startMsg, [
                          { text: t.alerts.no },
                          {
                            text: t.alerts.yes,
                            onPress: () => startGatheringMutate(id),
                          },
                        ])
                      }
                    >
                      <Text
                        style={[styles.hostBtnText, { color: Colors.card }]}
                      >
                        {t.start}
                      </Text>
                      <Ionicons
                        name="happy-outline"
                        size={21}
                        color={Colors.card}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.hostBtn, { backgroundColor: Colors.red }]}
                      onPress={() =>
                        Alert.alert(t.alerts.cancelTitle, t.alerts.cancelMsg, [
                          { text: t.alerts.no },
                          {
                            text: t.alerts.yes,
                            onPress: () => cancelGatheringMutate(id),
                          },
                        ])
                      }
                    >
                      <Text style={styles.hostBtnText}>{t.cancel}</Text>
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={Colors.text}
                      />
                    </TouchableOpacity>
                  </>
                )}

                {gathering.status === "IN_PROGRESS" && (
                  <TouchableOpacity
                    style={[styles.hostBtn, { backgroundColor: Colors.orange }]}
                    onPress={() =>
                      Alert.alert(t.alerts.finishTitle, t.alerts.finishMsg, [
                        { text: t.alerts.no },
                        {
                          text: t.alerts.yes,
                          onPress: () => completeGatheringMutate(id),
                        },
                      ])
                    }
                  >
                    <Text style={styles.hostBtnText}>{t.finish}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        <View style={[styles.divider, { marginTop: 20 }]} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={Colors.green}
          />
          <Text style={styles.listSectionTitle}>{t.approvedTitle}</Text>
        </View>
        {approvedParticipants.length === 0 ? (
          <Text style={styles.emptyText}>{t.emptyApproved}</Text>
        ) : (
          approvedParticipants.map((p) => (
            <View key={p.id}>
              <GatheringUserCard
                user={p.user}
                roleTag={undefined}
                participantId={p.id}
                currentStatus={"APPROVED"}
                me={me}
                gathering={gathering}
                isHost={isHost}
                activeMenuUserId={activeMenuUserId}
                setActiveMenuUserId={setActiveMenuUserId}
                handleCloseMenu={handleCloseMenu}
                sendFriendRequestMutation={sendFriendRequestMutate}
                requestDmMutation={requestDmMutate}
                blockUserMutation={blockUserMutate}
                pendingMutation={pendingMutate}
                approveMutation={approveMutate}
                banMutation={banMutate}
                Colors={Colors}
                styles={styles}
              />
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
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={Colors.emerald}
          />

          <Text style={styles.listSectionTitle}>{t.pendingTitle}</Text>
        </View>
        {pendingParticipants.length === 0 ? (
          <Text style={styles.emptyText}>{t.emptyPending}</Text>
        ) : (
          pendingParticipants.map((p) => (
            <View key={p.id}>
              <GatheringUserCard
                user={p.user}
                roleTag={undefined}
                participantId={p.id}
                currentStatus={"PENDING"}
                me={me}
                gathering={gathering}
                isHost={isHost}
                activeMenuUserId={activeMenuUserId}
                setActiveMenuUserId={setActiveMenuUserId}
                handleCloseMenu={handleCloseMenu}
                sendFriendRequestMutation={sendFriendRequestMutate}
                requestDmMutation={requestDmMutate}
                blockUserMutation={blockUserMutate}
                pendingMutation={pendingMutate}
                approveMutation={approveMutate}
                banMutation={banMutate}
                Colors={Colors}
                styles={styles}
              />
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
                          t.alerts.cancelApplyTitle,
                          t.alerts.cancelApplyMsg,
                          [
                            { text: t.alerts.no },
                            {
                              text: t.alerts.yes,
                              onPress: () => cancelApplyMutate(),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.applyButtonText}>
                        {t.cancelApply}
                      </Text>
                      <Ionicons
                        name="sad-outline"
                        size={21}
                        color={Colors.card}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => applyMutate()}
                >
                  <Text style={styles.applyButtonText}>{t.apply}</Text>
                  <Ionicons
                    name="happy-outline"
                    size={21}
                    color={Colors.card}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
      </ScrollView>

      <GatheringModal
        mode="edit"
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        category={category}
        setCategory={setCategory}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        selectedDateStr={selectedDateStr}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        selectedMinute={selectedMinute}
        setSelectedMinute={setSelectedMinute}
        maxPeople={maxPeople}
        setMaxPeople={setMaxPeople}
        onSubmit={handleEditGathering}
        isPending={editGatheringPending}
        handleDayPress={handleDayPress}
        styles={styles}
      />

      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetNickname={gathering.host?.nickname!}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        reportDetails={reportDetails}
        onChangeReportDetails={setReportDetails}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
        isEditable={false}
      />

      <NoShowModal
        isOpen={isNoShowModalOpen}
        onClose={() => setIsNoShowModalOpen(false)}
        participants={gathering?.participants}
        meId={me?.id}
        noShowMutation={noShowMutate}
        handleCompleteCheck={handleCompleteCheck}
        styles={styles}
      />
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  userCard: {
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
    position: "relative",
  },
  inlineTabPopover: {
    position: "absolute",
    left: 48,
    top: -16,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    width: 110,
    marginHorizontal: 5,
    height: 1,
    marginVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chatButtonActive: {
    borderColor: Colors.green,
    backgroundColor: "rgba(255, 204, 0, 0.1)",
  },
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
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    fontStyle: "italic",
  },
  content: { padding: 16, paddingBottom: 50, paddingTop: 20 },
  editIconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: { color: Colors.text, fontSize: 12, fontWeight: "600" },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: Colors.green,
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { color: Colors.gray, fontWeight: "bold", fontSize: 12.5 },
  title: {
    fontSize: 22,
    fontWeight: Platform.OS === "ios" ? "800" : "600",
    color: "#f3f4f6",
    marginBottom: 8,
  },
  description: { fontSize: 15, color: Colors.gray, lineHeight: 22 },
  divider: { height: 1, backgroundColor: Colors.border, marginTop: 12 },

  infoSection: {
    gap: 10,
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: Colors.text },
  highlightText: { color: Colors.green, fontWeight: "bold" },

  hostBox: {
    backgroundColor: Colors.card,
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
    flexDirection: "row",
    gap: 3,
    justifyContent: "center",
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
    backgroundColor: Colors.green,
    padding: 8,
    borderRadius: 6,
  },
  btnApprove: {
    backgroundColor: Colors.green,
    padding: 8,
    borderRadius: 6,
  },
  btnBan: {
    backgroundColor: Colors.red,
    padding: 8,
    borderRadius: 6,
  },
  emptyText: {
    textAlign: "center",
    padding: 21,
    backgroundColor: Colors.card,
    borderRadius: 12,
    color: Colors.tabIconDefault,
    fontSize: 13,
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 3,
  },
  applyButtonText: {
    marginBottom: 1,
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
    marginBottom: 24,
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
    marginBottom: Platform.OS === "android" ? 32 : 0,
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
    marginTop: 24,
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
  modalCategoryChipActive: { backgroundColor: Colors.green },
  modalCategoryText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  modalCategoryTextActive: { color: Colors.card },
  inlineCalendar: { borderRadius: 8, overflow: "hidden" },

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
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  noShowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    backgroundColor: Colors.red,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginBottom: Platform.OS === "android" ? 50 : 0,
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
  modalFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#2A2A2A",
  },
  completeBtn: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  completeBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  roomCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  roomCodeLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  roomCodeText: {
    fontSize: 13,
    color: Colors.green,
    fontWeight: "bold",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    letterSpacing: 1,
  },
  saveButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#000000", fontSize: 16, fontWeight: "700" },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderColor: Colors.red,
  },
  chipText: {
    fontSize: 13,
    color: Colors.tabIconDefault,
  },
  chipTextSelected: {
    color: Colors.red,
    fontWeight: "600",
  },
});
