import { DmMenuPopoverProps } from "@/types/DM/DmMenuPopoverProps";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export const DmMenuPopover = ({
  partnerId,
  partnerName,
  onClose,
  onNavigateProfile,
  onSendFriendRequest,
  onBlockUser,
  styles,
}: DmMenuPopoverProps) => {
  return (
    <View style={styles.inlineTabPopover}>
      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onNavigateProfile(partnerId);
        }}
      >
        <Text style={styles.popoverText}>프로필 보기</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onSendFriendRequest(partnerId);
        }}
      >
        <Text style={styles.popoverText}>친구 요청</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          Alert.alert("유저 차단", `${partnerName}님을 차단하시겠습니까?`, [
            { text: "취소", style: "cancel" },
            {
              text: "차단",
              style: "destructive",
              onPress: () => onBlockUser(partnerId || ""),
            },
          ]);
        }}
      >
        <Text style={[styles.popoverText, { color: "#FF5252" }]}>차단</Text>
      </TouchableOpacity>
    </View>
  );
};
