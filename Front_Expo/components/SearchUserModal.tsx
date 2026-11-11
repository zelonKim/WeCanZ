import { SearchUserModalProps } from "@/types/user/SearchUserModalProps";
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

export const SearchUserModal: React.FC<SearchUserModalProps> = ({
  visible,
  onClose,
  searchNickname,
  onChangeSearchNickname,
  onSearch,
  t,
  styles,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t.searchModalTitle}</Text>
            <Text style={styles.modalSubtitle}>{t.searchModalSubtitle}</Text>

            <TextInput
              style={styles.input}
              placeholder={t.searchInputPlaceholder}
              placeholderTextColor="#666"
              value={searchNickname}
              onChangeText={onChangeSearchNickname}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>{t.cancelButton}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={onSearch}
              >
                <Text style={styles.confirmBtnText}>{t.searchButton}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
