import { FriendItemRowProps } from "@/types/friend/FriendItemProps";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export const FriendItemRow = ({
  item,
  styles,
  Colors,
  t,
  renderAvatar,
  onRequestDm,
  onBlockUser,
}: FriendItemRowProps) => {
  const friend = item.friendUser || (item as any);
  const targetUserId = friend.id || item.id;

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        {renderAvatar(friend.profileImage)}
        <Text style={styles.nickname} numberOfLines={1}>
          {friend.nickname}
        </Text>
      </View>

      <View style={styles.actionIconGroup}>
        <TouchableOpacity
          style={styles.dmActionBtn}
          onPress={() => onRequestDm(targetUserId, friend)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.card} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blockActionBtn}
          onPress={() =>
            Alert.alert(
              t.alerts.blockConfirmTitle,
              t.alerts.blockConfirmMsg(friend.nickname),
              [
                { text: t.cancel, style: "cancel" },
                {
                  text: t.alerts.blockAction,
                  style: "destructive",
                  onPress: () => onBlockUser(targetUserId),
                },
              ],
            )
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="person-remove-outline"
            size={22}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
