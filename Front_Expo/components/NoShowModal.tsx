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
            <Text style={styles.modalTitle}>참가자 노쇼 체크</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredParticipants}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.participantRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.participantName}>
                    {item.user?.nickname || "참가자"}
                  </Text>
                  {item.status === "NO_SHOW" && (
                    <Text style={styles.noShowBadge}>노쇼 처리됨</Text>
                  )}
                  {item.status === "YES_SHOW" && (
                    <Text style={styles.yesShowBadge}>예스쇼 처리됨</Text>
                  )}
                </View>

                {item.userId !== meId && item.status !== "NO_SHOW" && (
                  <TouchableOpacity
                    style={styles.noShowBtn}
                    onPress={() =>
                      Alert.alert(
                        "노쇼 처리",
                        `${item.user?.nickname} 님을 노쇼 처리하시겠습니까?`,
                        [
                          { text: "취소", style: "cancel" },
                          {
                            text: "확인",
                            style: "destructive",
                            onPress: () => noShowMutation(item.id),
                          },
                        ],
                      )
                    }
                  >
                    <Text style={styles.noShowBtnText}>노쇼 처리</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleCompleteCheck}
              activeOpacity={0.8}
            >
              <Text style={styles.completeBtnText}>체크 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
