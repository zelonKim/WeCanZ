import { useDmMenuPopoverLanguage } from "@/hooks/Languages/useDmMenuPopoverLanguage";
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
  const { t } = useDmMenuPopoverLanguage();

  return (
    <View style={styles.inlineTabPopover}>
      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onNavigateProfile(partnerId);
        }}
      >
        <Text style={styles.popoverText}>{t.menu.viewProfile}</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          onSendFriendRequest(partnerId);
        }}
      >
        <Text style={styles.popoverText}>{t.menu.friendRequest}</Text>
      </TouchableOpacity>

      <View style={styles.popoverDivider} />

      <TouchableOpacity
        style={styles.popoverItem}
        onPress={() => {
          onClose();
          Alert.alert(t.alerts.blockTitle, t.alerts.blockConfirm(partnerName), [
            { text: t.alerts.cancel, style: "cancel" },
            {
              text: t.alerts.block,
              style: "destructive",
              onPress: () => onBlockUser(partnerId || ""),
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
