import { useNoShowModalLanguage } from "@/hooks/Languages/useNoShowModalLanguage"; // 👈 다국어 훅 임포트
import { NoShowModalProps } from "@/types/gathering/NoShowModalProps";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const NoShowModal: React.FC<NoShowModalProps> = ({
  isOpen,
  onClose,
  participants,
  meId,
  noShowMutation,
  handleCompleteCheck,
  styles,
}) => {
  const { t } = useNoShowModalLanguage(); 

  const filteredParticipants = (participants || []).filter(
    (item) =>
      item.userId !== meId &&
      (item.status === "APPROVED" ||
        item.status === "YES_SHOW" ||
        item.status === "NO_SHOW"),
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.modalTitle}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredParticipants}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const nickname = item.user?.nickname || t.defaultUser;

              return (
                <View style={styles.participantRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.participantName}>{nickname}</Text>
                    {item.status === "NO_SHOW" && (
                      <Text style={styles.noShowBadge}>{t.noShowBadge}</Text>
                    )}
                    {item.status === "YES_SHOW" && (
                      <Text style={styles.yesShowBadge}>{t.yesShowBadge}</Text>
                    )}
                  </View>

                  {item.userId !== meId && item.status !== "NO_SHOW" && (
                    <TouchableOpacity
                      style={styles.noShowBtn}
                      onPress={() =>
                        Alert.alert(
                          t.alerts.title,
                          t.alerts.message(nickname),
                          [
                            { text: t.alerts.cancel, style: "cancel" },
                            {
                              text: t.alerts.confirm,
                              style: "destructive",
                              onPress: () => noShowMutation(item.id),
                            },
                          ],
                        )
                      }
                    >
                      <Text style={styles.noShowBtnText}>{t.noShowBtn}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleCompleteCheck}
              activeOpacity={0.8}
            >
              <Text style={styles.completeBtnText}>{t.completeCheckBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
