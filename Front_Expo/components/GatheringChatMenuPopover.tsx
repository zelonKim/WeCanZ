import { useGatheringChatMenuLanguage } from "@/hooks/Languages/useGatheringChatMenuLanguage";
import { GatheringChatMenuPopoverProps } from "@/types/gathering/GatheringChatMenuPopoverProps";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export const GatheringChatMenuPopover = ({
  msg,
  onClose,
  onViewProfile,
  onSendFriendRequest,
  onRequestDm,
  onBlockUser,
  styles,
}: GatheringChatMenuPopoverProps) => {
  const { t } = useGatheringChatMenuLanguage();

  const userId = msg.user?.id || "";
  const nickname = msg.user?.nickname || "";

  return (
    <View style={styles.inlineTabPopover}>
      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onViewProfile(userId);
        }}
      >
        <Text style={styles.popoverText}>{t.menu.viewProfile}</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onSendFriendRequest(userId);
        }}
      >
        <Text style={styles.popoverText}>{t.menu.friendRequest}</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onRequestDm(userId);
        }}
      >
        <Text style={styles.popoverText}>{t.menu.requestDm}</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          Alert.alert(t.alerts.blockTitle, t.alerts.blockConfirm(nickname), [
            { text: t.alerts.cancel, style: "cancel" },
            {
              text: t.alerts.block,
              style: "destructive",
              onPress: () => onBlockUser(userId, nickname),
            },
          ]);
        }}
      >
        <Text style={[styles.popoverText, { color: "#FF5252" }]}>
          {t.menu.block}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
