import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserProfile {
  id: string;
  profileImage?: string;
  nickname: string;
  bio?: string;
  noShowCount: number;
  yesShowCount: number;
  createdAt: string;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile", id],
    queryFn: async () => {
      const { data } = await client.get(`/user/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.background }]}
      >
        <ActivityIndicator
          size="large"
          color={Colors.green}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: Colors.background }]}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>유저 정보를 불러올 수 없습니다.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "-";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* 상단 네비게이션바 */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 보기</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* 상단 프로필 이미지 & 닉네임 */}
        <View style={styles.headerSection}>
          {user.profileImage ? (
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.profileImage,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Ionicons name="person" size={40} color={Colors.text} />
            </View>
          )}

          <Text style={styles.nickname}>{user.nickname}</Text>
          <Text style={styles.bio}>
            {user.bio || "등록된 자기소개가 없습니다."}
          </Text>
        </View>

        {/* 활동 통계 (참석 / 노쇼 횟수) */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>예스쇼</Text>
            <Text style={[styles.statValue, { color: Colors.green }]}>
              {user.yesShowCount}회
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>노쇼</Text>
            <Text
              style={[styles.statValue, { color: Colors.red || "#FF453A" }]}
            >
              {user.noShowCount}회
            </Text>
          </View>
        </View>

        {/* 상세 정보 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>가입일</Text>
            <Text style={styles.infoVal}>{formattedDate}</Text>
          </View>
        </View>
      </View>

      {/* 프로필 사진 확대 보기 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            {user.profileImage && (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.fullProfileImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2C2C2E",
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  content: { padding: 24, gap: 24 },
  headerSection: { alignItems: "center", gap: 10, marginTop: 12 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2C2C2E",
  },
  nickname: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  bio: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: { alignItems: "center", gap: 4 },
  statLabel: { fontSize: 13, color: "#8E8E93" },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statDivider: { width: 1, height: 24, backgroundColor: "#2C2C2E" },
  infoCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoKey: { fontSize: 14, color: "#8E8E93" },
  infoVal: { fontSize: 14, color: "#FFF", fontWeight: "500" },
  errorText: { color: "#FFF", fontSize: 16 },
  backBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: "#FFF", fontWeight: "bold" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullProfileImage: {
    width: "90%",
    height: "70%",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 20,
  },
});
