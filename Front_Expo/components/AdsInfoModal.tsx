import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface AdsInfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  contactEmail?: string;
  emailLabel?: string;
  closeText: string;
  styles: any;
}

export const AdsInfoModal: React.FC<AdsInfoModalProps> = ({
  visible,
  onClose,
  title,
  description,
  contactEmail = "ksz18601@gmail.com",
  emailLabel,
  closeText,
  styles,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{description}</Text>

          {contactEmail && (
            <View style={styles.modalEmailContainer}>
              <Text style={styles.modalSubText}>
                {emailLabel ? `${emailLabel} ` : ""}
                {contactEmail}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCloseButtonText}>{closeText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
