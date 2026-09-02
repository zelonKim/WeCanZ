import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TermsModalProps {
  visible: boolean;
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

export default function TermsModal({
  visible,
  type,
  onClose,
}: TermsModalProps) {
  const title = type === "terms" ? "서비스 이용 약관" : "개인정보 처리 방침";

  const content =
    type === "terms"
      ? `제 1조 (목적)\n본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 술번개, 클럽번개 등 온·오프라인 소모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.\n\n제 2조 (금지 행위)\n1. 회원은 서비스 이용 시 타인을 비방하거나 성희롱, 욕설, 영리 목적의 홍보, 타인 사칭 등의 행위를 해서는 안 됩니다.\n2. 운영자는 위반 행위가 적발될 경우 사전 통보 없이 이용 정지 혹은 강제 탈퇴 등의 조치를 취할 수 있습니다.\n\n제 3조 (책임의 제한)\n1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 접촉 및 각종 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.\n2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.\n3. 플랫폼은 회원이 게시하거나 전송한 정보의 진위여부나 정확성에 대해 보증하지 않으며, 회원 간의 상호작용으로 인해 발생하는 손해에 대해 면책됩니다.`
      : `제 1조 (수집하는 개인정보 항목)\n본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.\n\n제 2조 (개인정보의 보유 및 이용 기간)\n수집된 개인정보는 회원 탈퇴 시 즉시 파기되는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보관이 필요한 경우 안전하게 분리 보관됩니다.\n\n제 3조 (개인정보의 파기 절차 및 방법)\n회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제됩니다.\n\n제 4조 (개인정보의 제3자 제공)\n본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalText}>{content}</Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "75%",
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 14,
    textAlign: "center",
  },
  modalScroll: {
    marginVertical: 6,
  },
  modalText: {
    fontSize: 13,
    color: "#B0B0B0",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
