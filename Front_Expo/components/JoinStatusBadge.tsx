import Colors from "@/constants/Colors";
import { MyGathering } from "@/types/gathering/MyGathering";
import { MyInfo } from "@/types/user/MyInfo";
import { StyleSheet, Text, View } from "react-native";

export const JoinStatusBadge = (gathering: MyGathering, me: MyInfo, t: any) => {
  if (String(gathering.hostId) === String(me?.id)) {
    return (
      <View style={[styles.badge, styles.badgeHost]}>
        <Text style={styles.badgeTextHost}>{t.badgeHost}</Text>
      </View>
    );
  }

  const myParticipant = gathering.participants?.find(
    (p) => String(p.userId) === String(me?.id),
  );

  if (myParticipant?.status === "APPROVED") {
    return (
      <View style={[styles.badge, styles.badgeApproved]}>
        <Text style={styles.badgeTextApproved}>{t.badgeApproved}</Text>
      </View>
    );
  }

  if (myParticipant?.status === "PENDING") {
    return (
      <View style={[styles.badge, styles.badgePending]}>
        <Text style={styles.badgeTextPending}>{t.badgePending}</Text>
      </View>
    );
  }

  return null;
};


////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
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
