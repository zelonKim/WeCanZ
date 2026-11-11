import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

interface GatheringChatMenuPopoverProps {
  msg: any;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onRequestDm: (userId: string) => void;
  onBlockUser: (userId: string, nickname?: string) => void;
  styles: any;
}

export const GatheringChatMenuPopover = ({
  msg,
  onClose,
  onViewProfile,
  onSendFriendRequest,
  onRequestDm,
  onBlockUser,
  styles,
}: GatheringChatMenuPopoverProps) => {
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
        <Text style={styles.popoverText}>프로필 보기</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onSendFriendRequest(userId);
        }}
      >
        <Text style={styles.popoverText}>친구 요청</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onRequestDm(userId);
        }}
      >
        <Text style={styles.popoverText}>DM 요청</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          Alert.alert("유저 차단", `${nickname}님을 차단하시겠습니까?`, [
            { text: "취소", style: "cancel" },
            {
              text: "차단",
              style: "destructive",
              onPress: () => onBlockUser(userId, nickname),
            },
          ]);
        }}
      >
        <Text style={[styles.popoverText, { color: "#FF5252" }]}>차단</Text>
      </TouchableOpacity>
    </View>
  );
};
