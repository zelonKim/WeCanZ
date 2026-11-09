import { BlockManagementModalProps } from "@/types/friend/BlockManagementModalProps";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const BlockManagementModal = ({
  visible,
  onClose,
  blockNickname,
  setBlockNickname,
  onBlockSubmit,
  blockedUsers,
  isBlockedLoading,
  onRefreshBlocked,
  onUnblock,
  renderAvatar,
  Colors,
  t,
  styles,
}: BlockManagementModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContentCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.blockModalTitle}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.text || "#212529"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.directBlockContainer}>
              <TextInput
                style={styles.directBlockInput}
                placeholder={t.nicknamePlaceholder}
                placeholderTextColor="#888"
                value={blockNickname}
                multiline
                onChangeText={setBlockNickname}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.directBlockBtn}
                onPress={onBlockSubmit}
              >
                <Text style={styles.directBlockBtnText}>{t.blockBtnText}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.subListTitle}>
              {t.blockedListTitle(blockedUsers.length)}
            </Text>

            <FlatList
              data={blockedUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalListContent}
              style={{ maxHeight: 350 }}
              refreshControl={
                <RefreshControl
                  refreshing={isBlockedLoading}
                  onRefresh={onRefreshBlocked}
                />
              }
              renderItem={({ item }) => {
                const user = item.receiver || (item as any);
                const targetUserId = user.id || item.id;
                const userName = user.nickname || "알 수 없음";

                return (
                  <View style={styles.card}>
                    <View style={styles.userInfo}>
                      {renderAvatar(user.profileImage)}
                      <Text style={styles.nickname}>{userName}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.btnUnblock}
                      onPress={() =>
                        Alert.alert(
                          t.alerts.unblockConfirmTitle,
                          t.alerts.unblockConfirmMsg(userName),
                          [
                            { text: t.cancel, style: "cancel" },
                            {
                              text: t.alerts.unblockAction,
                              onPress: () => onUnblock(targetUserId),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.btnUnblockText}>{t.unblockBtn}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>{t.emptyBlocked}</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
