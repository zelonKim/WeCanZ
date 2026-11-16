import { useGatheringUserCardLanguage } from "@/hooks/Languages/useGatheringUserCardLanguage";
import { GatheringUserCardProps } from "@/types/gathering/GatheringUserCardProps";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export const GatheringUserCard: React.FC<GatheringUserCardProps> = ({
  user,
  roleTag,
  participantId,
  currentStatus,
  me,
  gathering,
  isHost,
  activeMenuUserId,
  setActiveMenuUserId,
  handleCloseMenu,
  sendFriendRequestMutation,
  requestDmMutation,
  blockUserMutation,
  pendingMutation,
  approveMutation,
  banMutation,
  Colors,
  styles,
}) => {
  const router = useRouter();
  const { t } = useGatheringUserCardLanguage();

  const isMe = String(user?.id) === String(me?.id);
  const isMenuOpen = activeMenuUserId === user?.id;
  const isUserHost = String(user?.id) === String(gathering?.hostId);
  const displayRoleTag = roleTag || (isUserHost ? t.hostBadge : undefined);

  return (
    <View style={[styles.userCard, { zIndex: isMenuOpen ? 999 : 1 }]}>
      <View style={styles.userInfoLeft}>
        <TouchableOpacity
          activeOpacity={isMe ? 1 : 0.5}
          onPress={() => {
            if (user && !isMe) {
              setActiveMenuUserId(isMenuOpen ? null : user.id);
            }
          }}
        >
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={Colors.text} />
            </View>
          )}
        </TouchableOpacity>

        {isMenuOpen && user && (
          <View style={styles.inlineTabPopover}>
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                handleCloseMenu();
                router.push(`/profile/${user.id}`);
              }}
            >
              <Text style={styles.popoverText}>{t.viewProfile}</Text>
            </TouchableOpacity>

            <View style={styles.popoverDivider} />

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                handleCloseMenu();
                sendFriendRequestMutation(user.id);
              }}
            >
              <Text style={styles.popoverText}>{t.friendRequest}</Text>
            </TouchableOpacity>

            <View style={styles.popoverDivider} />

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                handleCloseMenu();
                requestDmMutation(user.id);
              }}
            >
              <Text style={styles.popoverText}>{t.dmRequest}</Text>
            </TouchableOpacity>

            <View style={styles.popoverDivider} />

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                handleCloseMenu();
                Alert.alert(
                  t.alerts.blockTitle,
                  t.alerts.blockMsg(user.nickname || ""),
                  [
                    { text: t.alerts.cancel, style: "cancel" },
                    {
                      text: t.alerts.blockConfirm,
                      style: "destructive",
                      onPress: () => blockUserMutation(user.id),
                    },
                  ],
                );
              }}
            >
              <Text style={[styles.popoverText, { color: "#FF5252" }]}>
                {t.block}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.nickname}</Text>
            {displayRoleTag && (
              <Text style={styles.roleBadge}>{displayRoleTag}</Text>
            )}
          </View>
          <Text style={styles.statsText}>
            {t.stats(user?.yesShowCount ?? 0, user?.noShowCount ?? 0)}
          </Text>
        </View>

        {isHost &&
          !isUserHost &&
          participantId &&
          gathering &&
          (gathering.status === "OPEN" || gathering.status === "FULL") && (
            <View style={styles.actionBtnGroup}>
              {currentStatus === "APPROVED" && (
                <TouchableOpacity
                  style={styles.btnPending}
                  onPress={() => pendingMutation(participantId)}
                >
                  <Ionicons
                    name="hourglass-outline"
                    size={16}
                    color={Colors.card}
                  />
                </TouchableOpacity>
              )}

              {currentStatus === "PENDING" && (
                <TouchableOpacity
                  style={styles.btnApprove}
                  onPress={() => approveMutation(participantId)}
                >
                  <Ionicons
                    name="checkbox-outline"
                    size={16}
                    color={Colors.card}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.btnBan}
                onPress={() =>
                  Alert.alert(t.alerts.banTitle, t.alerts.banMsg, [
                    { text: t.alerts.cancel, style: "cancel" },
                    {
                      text: t.alerts.banConfirm,
                      style: "destructive",
                      onPress: () => banMutation(participantId),
                    },
                  ])
                }
              >
                <Ionicons name="person-remove-outline" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
      </View>
    </View>
  );
};
