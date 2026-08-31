import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 모임 및 참여 정보 타입 정의
export interface Gathering {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime?: string;
  hostId: string;
  status: "OPEN" | "FULL" | "IN_PROGRESS" | "CANCELED" | "COMPLETED";
  participants?: {
    userId: string;
    status: "PENDING" | "APPROVED" | "BANNED" | "YES_SHOW" | "NO_SHOW";
  }[];
}

export default function FlashScreen() {
  const router = useRouter();

  // 1. 내 프로필 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 2. 내가 방장이거나 신청/참여 중인 모임 목록 조회
  const {
    data: myGatherings = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Gathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: async () => {
      const { data } = await client.get("/gathering/my");
      return data;
    },
    enabled: !!me?.id,

    select: (data) =>
      data.filter((gathering) =>
        ["OPEN", "FULL", "IN_PROGRESS"].includes(gathering.status),
      ),
  });

  // 3. 모임 상세 페이지로 이동
  const handlePressGathering = (gatheringId: string) => {
    router.push(`/gathering/${gatheringId}`);
  };

  // 나의 상태(방장, 승인됨, 대기중) 구분 뱃지 렌더링
  const renderStatusBadge = (gathering: Gathering) => {
    if (String(gathering.hostId) === String(me?.id)) {
      return (
        <View style={[styles.badge, { backgroundColor: Colors.orange }]}>
          <Text style={[styles.badgeText, { color: Colors.text }]}>
            👑 방장
          </Text>
        </View>
      );
    }

    const myParticipant = gathering.participants?.find(
      (p) => String(p.userId) === String(me?.id),
    );

    if (myParticipant?.status === "APPROVED") {
      return (
        <View style={[styles.badge, { backgroundColor: Colors.blue }]}>
          <Text style={styles.badgeText}>✅ 참여중</Text>
        </View>
      );
    }

    if (myParticipant?.status === "PENDING") {
      return (
        <View style={[styles.badge, { backgroundColor: Colors.yellow }]}>
          <Text style={[styles.badgeText, { color: Colors.card }]}>
            ⏳ 승인 대기중
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 헤더 */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ 나의 벙개</Text>

        {/* 🚀 우측 아이콘 버튼 */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/flash/done")}
          activeOpacity={0.5}
        >
          <Ionicons name="time-outline" size={25} color={Colors.yellow} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      {/* 목록 콘텐츠 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>
      ) : (
        <FlatList
          data={myGatherings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.tabIconDefault}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {/* <Ionicons
                name="flash-off-outline"
                size={48}
                color={Colors.tabIconDefault}
              /> */}
              <Text style={styles.emptyText}>
                현재 참여 중인 벙개가 없습니다.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handlePressGathering(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {renderStatusBadge(item)}
              </View>

              {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {item.location && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.red}
                  />
                  <Text style={styles.infoText}>{item.location}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 4, // 터치 영역 확보
  },
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 양쪽 끝 배치
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },

  listContent: { padding: 16, gap: 12 },
  emptyContainer: {
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 280,
    gap: 12,
  },
  emptyText: { color: Colors.tabIconDefault, fontSize: 15 },

  card: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.tabIconDefault,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
