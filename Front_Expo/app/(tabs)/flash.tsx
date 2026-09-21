import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

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

  const handlePressGathering = (gatheringId: string) => {
    router.push(`/gathering/${gatheringId}`);
  };

  const renderStatusBadge = (gathering: Gathering) => {
    if (String(gathering.hostId) === String(me?.id)) {
      return (
        <View style={[styles.badge, styles.badgeHost]}>
          <Text style={styles.badgeTextHost}>👑 방장</Text>
        </View>
      );
    }

    const myParticipant = gathering.participants?.find(
      (p) => String(p.userId) === String(me?.id),
    );

    if (myParticipant?.status === "APPROVED") {
      return (
        <View style={[styles.badge, styles.badgeApproved]}>
          <Text style={styles.badgeTextApproved}>✅ 참여중</Text>
        </View>
      );
    }

    if (myParticipant?.status === "PENDING") {
      return (
        <View style={[styles.badge, styles.badgePending]}>
          <Text style={styles.badgeTextPending}>⏳ 승인 대기중</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 1. 모던 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerTitleHighlight}>✅</Text> 참여중인 벙개
        </Text>

        {/* 히스토리 페이지 이동 버튼 */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/flash/done")}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={25} color="#FFE600" />
        </TouchableOpacity>
      </View>

      {/* 2. 목록 콘텐츠 */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFE600" />
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
              tintColor="#FFE600"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>⚡️</Text>
              <Text style={styles.emptyText}>
                현재 참여 중인 벙개가 없어요{"\n"}새로운 벙개에 참여해보세요!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
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
                <View style={styles.cardFooter}>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#FF453A"
                    />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#52525B" />
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

  /* 헤더 */
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
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
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#18181B",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.08)",
  },
  historyButtonText: {
    color: "#FFE600",
    fontSize: 13,
    fontWeight: "700",
  },

  /* 리스트 */
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: "#71717A",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },

  /* 모던 카드 디자인 */
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
    marginBottom: 10,
    gap: 10,
  },
  cardTitle: {
    fontSize: Platform.OS === "ios" ? 16.5 : 15.5,
    fontWeight: Platform.OS === "ios" ? "800" : "600",
    color: "#FFFFFF",
    flex: 1,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: "#A1A1AA",
    lineHeight: 20,
    marginBottom: 14,
  },

  /* 메타 정보 풋터 */
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#D4D4D8",
    fontWeight: "500",
  },

  /* 모던 뱃지 스타일링 */
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeHost: {
    backgroundColor: "rgba(255, 230, 0, 0.15)",
  },
  badgeTextHost: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFE600",
  },
  badgeApproved: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  badgeTextApproved: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4ADE80",
  },
  badgePending: {
    backgroundColor: "rgba(249, 115, 22, 0.15)",
  },
  badgeTextPending: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FB923C",
  },
});
