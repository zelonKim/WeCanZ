import { removeAccessToken } from "@/api/token";
import { createReport } from "@/api/user/createReport";
import { deleteAccount } from "@/api/user/deleteAccount";
import { deleteTokenFromServer } from "@/api/user/deleteTokenFromServer";
import { getMyInfo } from "@/api/user/getMyInfo";
import { saveTokenToServer } from "@/api/user/saveTokenToServer";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { updateProfile } from "@/api/user/updateProfile";
import Colors from "@/constants/Colors";
import { useSettingLanguage } from "@/hooks/useSettingLanguage";
import { ReportReason } from "@/types/user/ReportReason";
import { handleImagePick } from "@/utils/handleImagePick";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingScreen() {
  const t = useSettingLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  ////////////////////////////////////////////////////////////////////////

  const {
    data: me,
    isPending: myInfoPending,
    isError: myInfoError,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
  });

  useEffect(() => {
    if (me) {
      setNickname(me.nickname || "");
      setBio(me.bio || "");
      setProfileImage(me.profileImage || "");
      setIsMarketingAgreed(!!me.marketingAgreedAt);
    }
  }, [me]);

  ////////////////////////////////////////////////////////////////////////

  const { mutate: updateProfileMutation, isPending: updateProfilePending } =
    useMutation({
      mutationFn: updateProfile,
      onSuccess: () => {
        Alert.alert(t.alertSuccess, t.profileUpdated);
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      },
      onError: (error: any) => {
        const message = error.response?.data?.message;
        const displayMessage = Array.isArray(message) ? message[0] : message;
        Alert.alert(
          t.alertNotice,
          displayMessage || "처리 중 오류가 발생했습니다.",
        );
      },
    });

  ////////////////////////////////////////////////////////////////////////

  const handleSaveProfile = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      Alert.alert(t.alertWarning, "닉네임을 입력해 주세요.");
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 30) {
      Alert.alert(t.alertWarning, t.nicknameAlert);
      return;
    }

    let finalImageUrl = profileImage;

    try {
      if (
        profileImage &&
        (profileImage.startsWith("file://") ||
          profileImage.startsWith("content://"))
      ) {
        const data = await uploadProfileImage(profileImage);
        if (data?.imageUrl) {
          finalImageUrl = data.imageUrl;
        }
      }

      updateProfileMutation({
        nickname,
        bio,
        profileImage: finalImageUrl,
      });
    } catch (error) {
      console.error(error);
      Alert.alert(t.alertError, t.uploadImageError);
    }
  };

  ////////////////////////////////////////////////////////////////////////

  const { mutate: deleteAccountMutation } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      Alert.alert(t.alertNotice, "회원 탈퇴가 완료되었습니다.");
      await queryClient.cancelQueries();
      queryClient.clear();
      await removeAccessToken();
      router.replace("/login");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.";
      Alert.alert(t.alertError, msg);
    },
  });

  ////////////////////////////////////////////////////////////////////////

  const handleDeleteAccount = () => {
    Alert.alert(t.deleteAccountTitle, t.deleteAccountConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.deleteAccountAction,
        style: "destructive",
        onPress: () => deleteAccountMutation(),
      },
    ]);
  };

  ////////////////////////////////////////////////////////////////////////

  const handleLogout = () => {
    Alert.alert(t.logoutTitle, t.logoutConfirm, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.logoutAction,
        style: "destructive",
        onPress: async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await removeAccessToken();
          router.replace("/login");
        },
      },
    ]);
  };

  ////////////////////////////////////////////////////////////////////////

  const { mutate: createReportMutation } = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      Alert.alert(t.alertSuccess, t.reportSuccess);
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "신고 접수 중 오류가 발생했습니다.";
      Alert.alert(t.alertError, msg);
    },
    onSettled: () => {
      setIsSubmittingReport(false);
    },
  });

  ////////////////////////////////////////////////////////////////////////

  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      Alert.alert(t.alertWarning, t.reportTargetPlaceholder);
      return;
    }
    if (!reportDetails.trim()) {
      Alert.alert(t.alertWarning, t.reportDetailsPlaceholder);
      return;
    }

    setIsSubmittingReport(true);

    try {
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        Alert.alert(t.alertError, t.userNotFound);
        setIsSubmittingReport(false);
        return;
      }

      createReportMutation({
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || t.userNotFound;
      Alert.alert(t.alertError, msg);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////

  const handleSearchProfile = async () => {
    if (!searchNickname.trim()) {
      Alert.alert(t.alertNotice, t.enterNicknameAlert);
      return;
    }

    try {
      const searchedUser = await searchUserByNickname(searchNickname.trim());
      if (searchedUser && searchedUser.id) {
        setIsModalVisible(false);
        setSearchNickname("");
        router.push(`/profile/${searchedUser.id}`);
      }
    } catch (error: any) {
      const message = t.userNotFound;
      Alert.alert(t.alertError, message);
    }
  };

  ////////////////////////////////////////////////////////////////////////

  const handleTogglePushNoti = async (value: boolean) => {
    setIsPushEnabled(value);

    if (value) {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(t.permTitle, t.permDesc, [
          { text: t.cancel, style: "cancel" },
          { text: t.settingsButton, onPress: () => Linking.openSettings() },
        ]);
        setIsPushEnabled(false);
        return;
      }

      const token = await registerForPushNotificationsAsync();
      if (token) await saveTokenToServer(token);
    } else {
      await deleteTokenFromServer();
    }
  };

  ////////////////////////////////////////////////////////////////////////

  const handleToggleMarketing = async (value: boolean) => {
    setIsMarketingAgreed(value);

    try {
      if (value) {
        await updateProfile({
          marketingAgreedAt: new Date().toISOString(),
        });
      } else {
        await updateProfile({
          marketingAgreedAt: null,
        });
      }
    } catch (error) {
      setIsMarketingAgreed(!value);
      Alert.alert(t.alertNotice, "마케팅 수신 동의 상태 변경에 실패했습니다.");
    }
  };

  ////////////////////////////////////////////////////////////////////////

  if (myInfoPending) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  if (myInfoError || !me) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.tabIconDefault }}>{t.userNotFound}</Text>
      </SafeAreaView>
    );
  }

  ////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.headerTitle}</Text>

          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.profileSearchBtn}
          >
            <Ionicons name="search-outline" size={26} color={Colors.green} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {me.profileImage ? (
              <Image source={{ uri: me.profileImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Ionicons name="person" size={40} color={Colors.text} />
              </View>
            )}

            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setIsModalOpen(true)}
            >
              <Ionicons name="pencil" size={14} color={Colors.text} />
              <Text style={styles.editButtonText}>{t.editButton}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{me.nickname}</Text>
            <Text style={styles.userBio}>{me.bio || t.emptyBio}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.yesShow}</Text>
              <Text style={[styles.statValue, { color: Colors.green }]}>
                {me.yesShowCount ?? 0}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.noShow}</Text>
              <Text style={[styles.statValue, { color: Colors.red }]}>
                {me.noShowCount ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.sectionApp}</Text>

          <View style={styles.cardGroup}>
            <View style={styles.menuRow}>
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>{t.menuNotification}</Text>
              </View>
              <Switch
                value={isPushEnabled}
                onValueChange={handleTogglePushNoti}
                trackColor={{
                  false: "#E0E0E0",
                  true: Colors.green || "#4CAF50",
                }}
                thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                WebBrowser.openBrowserAsync("https://www.wecanbegenz.com/terms")
              }
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>{t.menuTerms}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.wecanbegenz.com/privacy",
                )
              }
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>{t.menuPrivacy}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                WebBrowser.openBrowserAsync(
                  "https://www.wecanbegenz.com/marketing",
                )
              }
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="cart-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>{t.menuMarketing}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            <View style={styles.menuRow}>
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="file-tray-full-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>{t.menuMarketingAgree}</Text>
              </View>
              <Switch
                value={isMarketingAgreed}
                onValueChange={handleToggleMarketing}
                trackColor={{
                  false: "#E0E0E0",
                  true: Colors.green,
                }}
                thumbColor={Platform.OS === "android" ? "#FFFFFF" : undefined}
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            <TouchableOpacity
              style={[styles.menuRow, { borderBottomWidth: 0 }]}
              onPress={() => setIsReportModalOpen(true)}
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={Colors.red}
                />
                <Text style={[styles.menuLabel, { color: Colors.red }]}>
                  {t.menuReport}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.sectionAccount}</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={Colors.text}
                />
                <Text style={styles.menuLabel}>{t.menuLogout}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuRow, { borderBottomWidth: 0 }]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="person-remove-outline"
                  size={18}
                  color={Colors.red}
                />
                <Text style={[styles.menuLabel, { color: Colors.red }]}>
                  {t.menuDeleteAccount}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.editModalTitle}</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.imagePickerContainer}>
                  <TouchableOpacity
                    onPress={() => handleImagePick(setProfileImage, t)}
                    style={styles.avatarPicker}
                  >
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatar,
                          { justifyContent: "center", alignItems: "center" },
                        ]}
                      >
                        <Ionicons name="person" size={40} color={Colors.text} />
                      </View>
                    )}
                    <View style={styles.cameraBadge}>
                      <Ionicons name="camera" size={14} color="#000" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.imagePickerHint}>{t.imageHint}</Text>
                </View>

                <Text style={styles.inputLabel}>{t.nicknameLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder={t.nicknamePlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                />

                <Text style={styles.inputLabel}>{t.bioLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t.bioPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={updateProfilePending}
              >
                {updateProfilePending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>{t.saveButton}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isReportModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReportModalOpen(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.reportModalTitle}</Text>
                <TouchableOpacity onPress={() => setIsReportModalOpen(false)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>{t.reportTargetLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={targetNickname}
                  onChangeText={setTargetNickname}
                  placeholder={t.reportTargetPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                />

                <Text style={styles.inputLabel}>{t.reportReasonLabel}</Text>
                <View style={styles.chipContainer}>
                  {Object.values(ReportReason).map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => setSelectedReason(reason)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {t.reportReasonLabels[reason]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>{t.reportDetailsLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  placeholder={t.reportDetailsPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: Colors.red }]}
                onPress={handleSubmitReport}
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>
                    {t.reportSubmitButton}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t.searchModalTitle}</Text>
              <Text style={styles.modalSubtitle}>{t.searchModalSubtitle}</Text>

              <TextInput
                style={styles.input}
                placeholder={t.searchInputPlaceholder}
                placeholderTextColor="#666"
                value={searchNickname}
                onChangeText={setSearchNickname}
                autoCapitalize="none"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>{t.cancelButton}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleSearchProfile}
                >
                  <Text style={styles.confirmBtnText}>{t.searchButton}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

//////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
    paddingBottom: -50,
  },
  profileSearchBtn: { padding: 4 },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: Platform.OS === "ios" ? 0 : 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: -8,
    textAlign: "center",
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: { backgroundColor: "#2C2C2E" },
  cancelBtnText: { color: "#FFF", fontWeight: "600" },
  confirmBtn: { backgroundColor: Colors.green },
  confirmBtnText: { color: "#000", fontWeight: "bold" },

  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.green,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },

  profileCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.green,
  },
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
  profileInfo: { marginBottom: 16 },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  userBio: { fontSize: 14, color: Colors.tabIconDefault, lineHeight: 20 },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: "60%", backgroundColor: Colors.border },
  statLabel: { fontSize: 12, color: Colors.tabIconDefault, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "700" },

  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.tabIconDefault,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabelGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuLabel: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalBody: { gap: 12, marginBottom: 20 },
  imagePickerContainer: { alignItems: "center", marginBottom: 12 },
  avatarPicker: { position: "relative" },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.green,
    borderRadius: 12,
    padding: 5,
  },
  imagePickerHint: {
    fontSize: 12,
    color: Colors.tabIconDefault,
    marginTop: 8,
  },
  inputLabel: { fontSize: 12, fontWeight: "600", color: Colors.tabIconDefault },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: { height: 70, textAlignVertical: "top" },
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
  deleteBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 24,
    height: 24,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});
