import { EditProfileModalProps } from "@/types/user/EditProfileModalProps";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profileImage,
  onImagePick,
  nickname,
  onChangeNickname,
  bio,
  onChangeBio,
  onSave,
  isPending,
  t,
  styles,
  Colors,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.editModalTitle}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  onPress={onImagePick}
                  style={styles.avatarPicker}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        { justifyContent: "center", alignItems: "center" },
                      ]}
                    >
                      <Ionicons name="person" size={40} color={Colors.text} />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={14} color="#000" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.imagePickerHint}>{t.imageHint}</Text>
              </View>

              <Text style={styles.inputLabel}>{t.nicknameLabel}</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={onChangeNickname}
                placeholder={t.nicknamePlaceholder}
                placeholderTextColor={Colors.tabIconDefault}
              />

              <Text style={styles.inputLabel}>{t.bioLabel}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={onChangeBio}
                placeholder={t.bioPlaceholder}
                placeholderTextColor={Colors.tabIconDefault}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>{t.saveButton}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
