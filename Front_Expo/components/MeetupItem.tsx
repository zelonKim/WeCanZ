import Colors from "@/constants/Colors";
import { STATUS_STYLE } from "@/constants/STATUS_STYLE";
import { Gathering } from "@/types/gathering/Gathering";
import { GatheringStatus } from "@/types/gathering/GatheringStatus";
import { formatDateTime } from "@/utils/formatDateTime";
import { getCategoryLabel } from "@/utils/getCategoryLabel";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const MeetupItem = (item: Gathering, t: any, currentLang: string) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/gathering/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeftGroup}>
          <View
            style={[
              styles.statusBadge,
              STATUS_STYLE(t)[item.status as GatheringStatus]?.badgeStyle,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                STATUS_STYLE(t)[item.status as GatheringStatus]?.textStyle,
              ]}
            >
              {STATUS_STYLE(t)[item.status as GatheringStatus]?.label ||
                item.status}
            </Text>
          </View>
          <Text style={styles.cardCategory}>
            {getCategoryLabel(t, item.category)}
          </Text>
        </View>

        <View style={styles.peopleBadge}>
          <Ionicons name="people-outline" size={13} color="#A1A1AA" />
          <Text style={styles.cardPeople}>
            {item.maxPeople}
            {t.people}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.infoGroup}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={Colors.green} />
            <Text style={styles.cardInfoText}>
              {formatDateTime(item.dateTime, currentLang)}
            </Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 4 }]}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.emerald}
            />
            <Text style={styles.cardInfoText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.hostContainer}>
          {item.host?.profileImage ? (
            <Image
              source={{ uri: item.host.profileImage }}
              style={styles.hostImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={18} color="#A1A1AA" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

////////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: Platform.OS === "ios" ? "700" : "600",
    color: Colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },

  peopleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#27272A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cardPeople: {
    fontSize: 11,
    color: "#D4D4D8",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: Platform.OS === "ios" ? "600" : "500",
    color: "#f3f4f6",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: "#A1A1AA",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  infoGroup: {
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardInfoText: {
    fontSize: 12,
    color: "#D4D4D8",
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  hostContainer: {
    justifyContent: "flex-end",
  },
  hostImage: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
});
