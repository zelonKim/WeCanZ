import { client } from "@/api/client";
import { removeAccessToken } from "@/api/token";
import Colors from "@/constants/Colors";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { data } = await client.delete("/user/account");
  return data;
};

export default function SettingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 내 정보 조회
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: fetchMyInfo,
  });

  // 로컬 UI 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

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
    onError: (error: any, variables) => {
      if (variables.isMarketingAgreed !== undefined) {
        setIsMarketingAgreed((prev) => !prev);
      }
      const msg = error.response?.data?.message || "수정에 실패했습니다.";
      Alert.alert("오류", msg);
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

  // 마케팅 수신 동의 토글 (Alert 없이 즉시 반응)
  const handleToggleMarketing = (value: boolean) => {
    setIsMarketingAgreed(value);
    profileMutation.mutate({ isMarketingAgreed: value });
  };

  // 프로필 저장
  const handleSaveProfile = () => {
    if (!nickname.trim()) {
      Alert.alert("경고", "닉네임을 입력해 주세요.");
      return;
    }
    profileMutation.mutate({ nickname, bio, profileImage });
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
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user.profileImage ? (
              <Image
                source={{
                  uri: user.profileImage,
                }}
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
                  color={Colors.yellow}
                ></Ionicons>
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
              <Text style={styles.statLabel}>✨ YesShow</Text>
              <Text style={[styles.statValue, { color: "#04d304" }]}>
                {user.yesShowCount ?? 0}회
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>🚫 NoShow</Text>
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
            {/* 마케팅 수신 동의 */}
            {/* <View style={styles.menuRow}>
              <View style={styles.menuLabelGroup}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={Colors.tabIconDefault}
                />
                <Text style={styles.menuLabel}>마케팅 정보 수신 동의</Text>
              </View>
              <Switch
                value={isMarketingAgreed}
                onValueChange={handleToggleMarketing}
                trackColor={{ false: "#3A3A3C", true: Colors.red }}
                thumbColor="#FFFFFF"
              />
            </View> */}

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
              style={[styles.menuRow, { borderBottomWidth: 0 }]}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프로필 수정</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* 이미지 선택 */}
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.avatarPicker}
                >
                  <Image
                    source={{
                      uri:
                        profileImage ||
                        "https://via.placeholder.com/100/2C2C2E/FFFFFF?text=User",
                    }}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={14} color="#000" />
                  </View>
                </TouchableOpacity>
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
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
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
  statValue: { fontSize: 15, fontWeight: "700" },

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

  /* 모달 */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
});
