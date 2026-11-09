import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SendDmModalProps {
  visible: boolean;
  onClose: () => void;
  targetNickname: string;
  setTargetNickname: (text: string) => void;
  onSubmit: () => void;
  t: any;
  styles: any;
}

export const SendDmModal = ({
  visible,
  onClose,
  targetNickname,
  setTargetNickname,
  onSubmit,
  t,
  styles,
}: SendDmModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.modalTitle}</Text>
            <Text style={styles.modalSubtitle}>{t.modalSubtitle}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder={t.nicknamePlaceholder}
              placeholderTextColor="#888"
              value={targetNickname}
              multiline
              onChangeText={setTargetNickname}
              autoCapitalize="none"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={onSubmit}
              >
                <Text style={styles.submitBtnText}>{t.sendRequest}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
