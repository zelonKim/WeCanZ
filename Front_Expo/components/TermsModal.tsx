import Colors from "@/constants/Colors";
import { useTermsModalLanguage } from "@/hooks/Languages/useTermsModalLanguage";
import { TermsModalProps } from "@/types/auth/TermsModalProps";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TermsModal({
  visible,
  type,
  onClose,
}: TermsModalProps) {
  const { t } = useTermsModalLanguage();

  const title = type ? t.titles[type] : "";
  const sections = type ? t.sections[type] : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={true}
          >
            {sections.map((section, index) => (
              <View key={index} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t.confirmBtn}</Text>
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
    width: "88%",
    maxHeight: "80%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  langBtn: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langBtnText: {
    color: Colors.green,
    fontSize: 11,
    fontWeight: "bold",
  },
  modalScroll: {
    marginVertical: 4,
    paddingRight: 4,
  },
  sectionContainer: {
    marginBottom: 18,
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: Colors.green,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: "#E5E5EA",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.background,
    fontWeight: "bold",
    fontSize: 14,
  },
});
