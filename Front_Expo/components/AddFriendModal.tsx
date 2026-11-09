import { AddFriendModalProps } from "@/types/friend/AddFriendModalProps";
import React from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";


export const AddFriendModal = ({
  visible,
  onClose,
  friendNickname,
  setFriendNickname,
  onSubmit,
  t,
  styles,
}: AddFriendModalProps) => {
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
        <View style={styles.addModalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.addModalTitle}>{t.addModalTitle}</Text>
            <Text style={styles.modalSubtitle}>{t.addModalSubtitle}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder={t.nicknamePlaceholder}
              placeholderTextColor="#888"
              value={friendNickname}
              multiline
              onChangeText={setFriendNickname}
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