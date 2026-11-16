import { getMyGatherings } from "@/api/gathering/getMyGatherings";
import { getMyInfo } from "@/api/user/getMyInfo";
import { JoinStatusBadge } from "@/components/JoinStatusBadge";
import Colors from "@/constants/Colors";
import { useFlashLanguage } from "@/hooks/Languages/useFlashLanguage";
import { MyGathering } from "@/types/gathering/MyGathering";
import { MyInfo } from "@/types/user/MyInfo";
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

export default function JoinedScreen() {
  const t = useFlashLanguage();
  const router = useRouter();

  const { data: me } = useQuery<MyInfo>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  const {
    data: myGatherings = [],
    isPending,
    isRefetching,
    refetch,
  } = useQuery<MyGathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: getMyGatherings,
    enabled: !!me?.id,
    select: (data) =>
      data.filter((gathering) =>
        ["OPEN", "FULL", "IN_PROGRESS"].includes(gathering.status),
      ),
  });

  /////////////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/joined/done")}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={25} color={Colors.green} />
        </TouchableOpacity>
      </View>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.green} />
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
              tintColor={Colors.green}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/gathering/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {me && JoinStatusBadge(item, me, t)}
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
                      color={Colors.emerald}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}></Text>
              <Text style={styles.emptyText}>{t.emptyMessage}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/////////////////////////////////////////////////////////////////////////////////////////

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.green,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  headerTitleHighlight: {
    fontSize: 20,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  historyButtonText: {
    color: Colors.green,
    fontSize: 13,
    fontWeight: "700",
  },
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
    color: Colors.green,
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
