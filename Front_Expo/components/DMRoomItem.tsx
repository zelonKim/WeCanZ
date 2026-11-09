import { DMRoomItemProps } from "@/types/DM/ DMRoomItemProps";
import { formatTime } from "@/utils/formatTime";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const DMRoomItem = ({
  item,
  styles,
  renderAvatar,
  onPressItem,
  onLongPressItem,
}: DMRoomItemProps) => {
  const partner = item.targetUser;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.6}
      onLongPress={() => onLongPressItem(item.id)}
      onPress={() => onPressItem(item)}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {renderAvatar(partner?.profileImage)}
          {item.hasUnread && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>N</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.nickname}>{partner?.nickname}</Text>
            {item.hasUnread && <View style={styles.dotBadge} />}
          </View>

          {item.lastMessage && (
            <Text
              style={[
                styles.lastMessage,
                item.hasUnread && styles.unreadMessageText,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.content || (item.lastMessage as any).message}
            </Text>
          )}
        </View>
      </View>

      {item.lastMessage?.createdAt && (
        <Text style={styles.timeText}>
          {formatTime(item.lastMessage.createdAt)}
        </Text>
      )}
    </TouchableOpacity>
  );
};
