import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gathering } from "../(tabs)/flash";

type TabType = "COMPLETED" | "CANCELED";

export default function DoneGatheringsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("COMPLETED");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const { data: doneGatherings = [], isLoading } = useQuery<Gathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: async () => {
      const { data } = await client.get("/gathering/my");
      return data;
    },
    enabled: !!me?.id,
    select: (data) =>
      data.filter((item) => ["COMPLETED", "CANCELED"].includes(item.status)),
  });

  const currentList = doneGatherings.filter(
    (item) => item.status === activeTab,
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 다크 모드 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>지난 벙개 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🚀 다크 모드 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "COMPLETED" && styles.activeCompleteTab,
          ]}
          onPress={() => setActiveTab("COMPLETED")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "COMPLETED" && styles.activeCompleteTabText,
            ]}
          >
            종료된 벙개
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "CANCELED" && styles.activeCancelTab,
          ]}
          onPress={() => setActiveTab("CANCELED")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "CANCELED" && styles.activeCancelTabText,
            ]}
          >
            취소된 벙개
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🚀 다크 모드 카드 리스트 */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/gathering/${item.id}`)}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={styles.cardContent} numberOfLines={2}>
              {item.description || "상세 내용이 없습니다."}
            </Text>

            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={Colors.red} />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {item.location || "장소 미정"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === "COMPLETED"
                ? "종료된 모임이 없습니다."
                : "취소된 모임이 없습니다."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" }, // 진한 다크 배경

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#2A2A2A",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },

  // 탭
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#2A2A2A",
  },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 15, color: "#777777" },
  activeCompleteTab: { borderBottomWidth: 2, borderColor: Colors.orange },
  activeCompleteTabText: { color: Colors.orange, fontWeight: "bold" },

  activeCancelTab: { borderBottomWidth: 2, borderColor: Colors.red },
  activeCancelTabText: { color: Colors.red, fontWeight: "bold" },
  // 리스트 및 카드
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#1E1E1E", // 카드 다크 배경
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: "#B0B0B0",
    lineHeight: 20,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: "#A0A0A0",
  },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#666666", fontSize: 14 },
});
