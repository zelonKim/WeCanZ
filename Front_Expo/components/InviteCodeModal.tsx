import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface InviteCodeModalProps {
  visible: boolean;
  inviteCode: string;
  onChangeCode: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  t: any; 
  styles: any;
}

export const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  visible,
  inviteCode,
  onChangeCode,
  onClose,
  onSubmit,
  isLoading,
  t,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? -200 : -150}
        style={{ flex: 1 }}
      >
        <View style={styles.inviteModalOverlay}>
          <View style={styles.inviteModalContainer}>
            <Text style={styles.inviteModalTitle}>{t.roomCodeTitle}</Text>
            <Text style={styles.inviteModalSubTitle}>{t.roomCodeSub}</Text>

            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              onChangeText={onChangeCode}
              placeholder="____"
              placeholderTextColor="#52525B"
              maxLength={4}
              autoCapitalize="none"
              autoCorrect={false}
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
                disabled={isLoading}
              >
                <Text style={styles.submitBtnText}>
                  {isLoading ? t.checking : t.enter}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};