import { getMyGatherings } from "@/api/gathering/getMyGatherings";
import { getMyInfo } from "@/api/user/getMyInfo";
import Colors from "@/constants/Colors";
import { useMeetupHistoryLanguage } from "@/hooks/Languages/useMeetupHistoryLanguage";
import { MyGathering } from "@/types/gathering/MyGathering";
import { TabType } from "@/types/joined/TabType";
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

export default function DoneGatheringsScreen() {
  const { t } = useMeetupHistoryLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("COMPLETED");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  /////////////////////////////////////////////////////////////////////////////////////

  const { data: doneGatherings = [] } = useQuery<MyGathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: getMyGatherings,
    enabled: !!me?.id,
    select: (data) =>
      data.filter((item) => ["COMPLETED", "CANCELED"].includes(item.status)),
  });

  const currentList = doneGatherings.filter(
    (item) => item.status === activeTab,
  );

  /////////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/joined")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

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
            {t.completedTab}
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
            {t.canceledTab}
          </Text>
        </TouchableOpacity>
      </View>

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
              {item.description || t.noDescription}
            </Text>

            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.emerald}
              />
              <Text style={styles.cardLocation} numberOfLines={1}>
                {item.location || t.noLocation}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === "COMPLETED" ? t.emptyCompleted : t.emptyCanceled}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontStyle: "italic",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#2A2A2A",
  },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 15, color: "#777777" },
  activeCompleteTab: { borderBottomWidth: 2, borderColor: Colors.green },
  activeCompleteTabText: { color: Colors.green, fontWeight: "bold" },
  activeCancelTab: { borderBottomWidth: 2, borderColor: Colors.red },
  activeCancelTabText: { color: Colors.red, fontWeight: "bold" },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  cardLocation: {
    fontSize: 13,
    color: "#A0A0A0",
  },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#666666", fontSize: 14 },
});
