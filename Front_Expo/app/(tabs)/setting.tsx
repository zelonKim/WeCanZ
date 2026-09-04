import { client } from "@/api/client";
import { removeAccessToken } from "@/api/token";
import Colors from "@/constants/Colors";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// 신고 사유 Enum (백엔드 ReportReason Enum 매핑)
enum ReportReason {
  SPAM = "SPAM",
  INAPPROPRIATE = "INAPPROPRIATE",
  ABUSE = "ABUSE",
  IMPERSONATION = "IMPERSONATION",
  OTHER = "OTHER",
}

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SPAM]: "불법 광고 및 도배",
  [ReportReason.INAPPROPRIATE]: "부적절한 콘텐츠",
  [ReportReason.ABUSE]: "욕설 및 혐오 발언",
  [ReportReason.IMPERSONATION]: "사칭 및 허위 정보",
  [ReportReason.OTHER]: "기타",
};

// API 요청 함수
const fetchMyInfo = async () => {
  const { data } = await client.get("/user/me");
  return data;
};

const updateProfile = async (updateDto: {
  nickname?: string;
  bio?: string;
  profileImage?: string;
  isMarketingAgreed?: boolean;
}) => {
  const { data } = await client.patch("/user/profile", updateDto);
  return data;
};

const deleteAccount = async () => {
  try {
    const { data } = await client.delete("/user/account");
    return data;
  } catch (error: any) {
    console.log(
      "=== 회원탈퇴 에러 상세 ===",
      error.response?.status,
      error.response?.data,
    );
  }
};

// 닉네임으로 유저 ID 조회 API
const searchUserByNickname = async (nickname: string) => {
  const { data } = await client.get(
    `/user/search/${encodeURIComponent(nickname)}`,
  );
  return data;
};

// 신고 API 요청 함수
const createReport = async (reportDto: {
  reportedUserId: string;
  reason: ReportReason;
  details: string;
}) => {
  const { data } = await client.post("/reports", reportDto);
  return data;
};

export default function SettingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // 프로필 조회 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");

  const handleSearchUser = async () => {
    if (!searchNickname.trim()) {
      Alert.alert("알림", "유저 닉네임을 입력해주세요.");
      return;
    }

    try {
      // 백엔드의 GET /users/search/:nickname 호출
      const { data } = await client.get(
        `/user/search/${searchNickname.trim()}`,
      );

      if (data && data.id) {
        setIsModalVisible(false);
        setSearchNickname("");
        // 유저 ID를 이용해 프로필 페이지로 이동
        router.push(`/profile/${data.id}`);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "존재하지 않는 유저입니다.";
      Alert.alert("오류", message);
    }
  };

  // 내 정보 조회
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: fetchMyInfo,
  });

  // 프로필 수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // 신고 모달 상태 (ID 대신 닉네임 입력)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // 마케팅 동의 즉각 반영용 로컬 상태
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  // 서버 데이터 로드시 로컬 상태 동기화
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setBio(user.bio || "");
      setProfileImage(user.profileImage || "");
      setIsMarketingAgreed(!!user.marketingAgreedAt);
    }
  }, [user]);

  // 프로필 수정 Mutation
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data, variables) => {
      if (variables.isMarketingAgreed === undefined) {
        Alert.alert("완료", "프로필이 성공적으로 수정되었습니다. ⚡");
        setIsModalOpen(false);
      }
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      Alert.alert("알림", displayMessage || "처리 중 오류가 발생했습니다.");
    },
  });

  // 신고 Mutation
  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      Alert.alert("신고 완료", "신고가 성공적으로 접수되었습니다.");
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "신고 접수 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    },
    onSettled: () => {
      setIsSubmittingReport(false);
    },
  });

  // 회원 탈퇴 Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      Alert.alert("알림", "회원 탈퇴가 완료되었습니다.");
      await removeAccessToken();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.";
      Alert.alert("오류", msg);
    },
  });

  // 갤러리 이미지 선택 핸들러
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "권한 필요",
        "사진을 선택하려면 갤러리 접근 권한이 필요합니다.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      Alert.alert("경고", "닉네임을 입력해 주세요.");
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
          finalImageUrl = data.imageUrl; // R2에서 받아온 공개 URL로 교체
        }
      }

      // 💡 R2 업로드가 끝난 최종 URL을 담아 기존 mutation 실행
      profileMutation.mutate({
        nickname,
        bio,
        profileImage: finalImageUrl,
      });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      Alert.alert("오류", "프로필 이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  // 신고 제출 (닉네임 조회 후 ID 추출 처리)
  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      Alert.alert("경고", "신고할 유저의 닉네임을 입력해주세요.");
      return;
    }
    if (!reportDetails.trim()) {
      Alert.alert("경고", "상세 신고 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReport(true);

    try {
      // 1. 닉네임으로 유저 정보 조회
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        Alert.alert("오류", "해당 닉네임을 가진 유저를 찾을 수 없습니다.");
        setIsSubmittingReport(false);
        return;
      }

      // 2. 조회된 유저 ID로 신고 API 호출
      reportMutation.mutate({
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "존재하지 않는 유저이거나 조회 실패했습니다.";
      Alert.alert("조회 실패", msg);
      setIsSubmittingReport(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await removeAccessToken();
          queryClient.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // 회원 탈퇴
  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말로 탈퇴하시겠습니까?\n계정 정보와 모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => deleteAccountMutation.mutate(),
        },
      ],
    );
  };

  const openTerms = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </SafeAreaView>
    );
  }

  if (isError || !user) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.tabIconDefault }}>
          유저 정보를 불러올 수 없습니다.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ 환경 설정</Text>

          {/* 💡 우측 프로필 보기 아이콘 버튼 */}
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.profileSearchBtn}
          >
            <Ionicons name="person-outline" size={26} color={Colors.yellow} />
          </TouchableOpacity>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
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

            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => setIsModalOpen(true)}
            >
              <Ionicons name="pencil" size={14} color={Colors.text} />
              <Text style={styles.editButtonText}>편집</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.nickname}</Text>
            <Text style={styles.userBio}>
              {user.bio || "아직 작성된 자기소개가 없습니다."}
            </Text>
          </View>

          {/* 신뢰도/매너 배지 */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>예스쇼</Text>
              <Text style={[styles.statValue, { color: Colors.yellow }]}>
                {user.yesShowCount ?? 0}회
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>노쇼</Text>
              <Text style={[styles.statValue, { color: Colors.red }]}>
                {user.noShowCount ?? 0}회
              </Text>
            </View>
          </View>
        </View>

        {/* 설정 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>

          <View style={styles.cardGroup}>
            {/* 이용약관 */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => openTerms("https://example.com/terms")}
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>서비스 이용약관</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            {/* 개인정보 처리방침 */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => openTerms("https://example.com/privacy")}
            >
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>개인정보 처리방침</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.tabIconDefault}
              />
            </TouchableOpacity>

            {/* 신고하기 버튼 */}
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
                  신고하기
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

        {/* 계정 관리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <View style={styles.cardGroup}>
            <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={Colors.text}
                />
                <Text style={styles.menuLabel}>로그아웃</Text>
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
                  회원 탈퇴
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

      {/* 프로필 수정 모달 */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -40}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>프로필 수정</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.imagePickerContainer}>
                  <View style={{ position: "relative" }}>
                    <TouchableOpacity
                      onPress={pickImage}
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
                          <Ionicons
                            name="person"
                            size={40}
                            color={Colors.text}
                          />
                        </View>
                      )}

                      {/* 카메라 뱃지 - 기존과 동일 */}
                      <View style={styles.cameraBadge}>
                        <Ionicons name="camera" size={14} color="#000" />
                      </View>
                    </TouchableOpacity>

                    {profileImage && (
                      <TouchableOpacity
                        onPress={() => setProfileImage("")} // 이미지 비우기
                        style={styles.deleteBadge}
                      >
                        <Ionicons name="close" size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.imagePickerHint}>
                    이미지를 터치하여 갤러리에서 선택하세요
                  </Text>
                </View>

                <Text style={styles.inputLabel}>닉네임</Text>
                <TextInput
                  style={styles.input}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="닉네임을 입력하세요"
                  placeholderTextColor={Colors.tabIconDefault}
                />

                <Text style={styles.inputLabel}>자기소개</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="자기소개를 입력하세요"
                  placeholderTextColor={Colors.tabIconDefault}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.saveButtonText}>저장하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 신고하기 모달 */}
      <Modal
        visible={isReportModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReportModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={"padding"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? -10 : -50}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🚨 유저 신고하기</Text>
                <TouchableOpacity onPress={() => setIsReportModalOpen(false)}>
                  <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>신고할 유저 닉네임</Text>
                <TextInput
                  style={styles.input}
                  value={targetNickname}
                  onChangeText={setTargetNickname}
                  placeholder="상대방 닉네임을 입력해주세요"
                  placeholderTextColor={Colors.tabIconDefault}
                />

                <Text style={styles.inputLabel}>신고 사유 선택</Text>
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
                          {REPORT_REASON_LABELS[reason]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>상세 내용</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  placeholder="신고 사유에 대한 상세 내용을 적어주세요."
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
                    신고 접수하기
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 💡 닉네임 검색 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={"padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>🔍 유저 프로필 찾기</Text>
              <Text style={styles.modalSubtitle}>
                찾고 싶은 유저의 닉네임을 입력하세요.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="닉네임 입력"
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
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleSearchUser}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>검색</Text>
                  )}
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
  container: { flex: 1, backgroundColor: Colors.background },
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
  confirmBtn: { backgroundColor: Colors.yellow || "#FFD700" },
  confirmBtnText: { color: "#000", fontWeight: "bold" },

  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.text },

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
    borderColor: Colors.yellow,
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

  /* 모달 공통 및 칩 스타일 */
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
    borderColor: Colors.yellow,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.yellow,
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
    backgroundColor: Colors.yellow,
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
    top: -5, // 오른쪽 상단 구석
    right: -5,
    backgroundColor: "rgba(0,0,0,0.6)", // 반투명 검은색 배경
    width: 24, // 터치 영역을 위해 아이콘보다 넉넉하게
    height: 24,
    borderRadius: 13, // 동그랗게
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20, // 다른 요소보다 위에 표시
  },
});
