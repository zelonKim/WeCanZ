import Colors from "@/constants/Colors";
import { useChatInputBarLanguage } from "@/hooks/Languages/useChatInputBarLanguage";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputBarProps {
  isBlocked?: boolean;
  blockedText?: string;
  selectedImage: string | null;
  onRemoveImage: () => void;
  onImagePick: () => void;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  insetsBottom: number;
  placeholderText?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  isBlocked = false,
  blockedText,
  selectedImage,
  onRemoveImage,
  onImagePick,
  inputText,
  onChangeText,
  onSend,
  insetsBottom,
  placeholderText,
}) => {
  const { t } = useChatInputBarLanguage();

  const finalBlockedText = blockedText || t.blockedText;
  const finalPlaceholder = placeholderText || t.placeholder;

  return (
    <View
      style={[
        styles.inputContainer,
        {
          paddingBottom:
            Platform.OS === "ios"
              ? Math.max(insetsBottom, 32)
              : Math.max(insetsBottom + 12, 60),
        },
      ]}
    >
      {isBlocked ? (
        <View style={styles.blockedBanner}>
          <Text style={styles.blockedText}>{finalBlockedText}</Text>
        </View>
      ) : (
        <View>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={onRemoveImage}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRowContainer}>
            <TouchableOpacity
              onPress={onImagePick}
              style={styles.imageButton}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={22} color="#a3a3a3" />
            </TouchableOpacity>

            <View style={[styles.inputCapsule]}>
              <TextInput
                style={styles.input}
                placeholder={finalPlaceholder}
                placeholderTextColor="#8E8E93"
                value={inputText}
                onChangeText={onChangeText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() &&
                    !selectedImage &&
                    styles.disabledSendButton,
                ]}
                onPress={onSend}
                disabled={!inputText.trim() && !selectedImage}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={inputText.trim() || selectedImage ? "#000" : "#525258"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#1E1E1E",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },

  headerButtonLeft: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  // 우측 버튼 고정 너비 (좌측과 동일하게 주어야 닉네임이 정확히 가운데 옵니다)
  headerButtonRight: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  // 중앙 컨테이너가 남은 공간을 차지하며 내부 요소를 센터 정렬
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  headerNickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: "75%",
  },
  myWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: Colors.green,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: Colors.card,
    fontWeight: "500",
  },
  otherText: {
    color: "#F2F2F7",
  },
  timeText: {
    fontSize: 9,
    color: "#4c4c4c",
    marginTop: 3,
    marginHorizontal: 4,
  },
  inputContainer: {
    paddingTop: 12,
    paddingHorizontal: Platform.OS === "ios" ? 20 : 15,
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: "#FFFFFF",
  },
  ReportInput: {
    backgroundColor: "#2C2C2E",
    color: Colors.text,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: "#3A3A3C",
  },
  blockedBanner: {
    height: 40, // flex: 1 제거하여 높이 찌그러짐 방지
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  blockedText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
  popoverItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popoverText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  popoverDivider: {
    width: 80,
    height: 1,
    marginVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  inlineTabPopover: {
    position: "absolute",
    left: 32,
    top: 12,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 9999,
    width: 130,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "85%",
    marginBottom: Platform.OS === "android" ? 32 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  modalBody: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  subInputLabel: {
    fontSize: 12,
    color: Colors.tabIconDefault,
    marginTop: 8,
    marginBottom: 4,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  categorySelectRow: { flexDirection: "row", gap: 8 },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCategoryChipActive: { backgroundColor: Colors.green },
  modalCategoryText: { color: Colors.text, fontSize: 13, fontWeight: "600" },
  modalCategoryTextActive: { color: Colors.card },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderColor: Colors.red,
  },
  chipText: {
    fontSize: 13,
    color: Colors.tabIconDefault,
  },
  chipTextSelected: {
    color: Colors.red,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: Colors.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#000000", fontSize: 16, fontWeight: "700" },
  inputCapsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 24,
    paddingHorizontal: 3,
    paddingVertical: Platform.OS === "ios" ? 4 : 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    left: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  chatImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 6,
  },
  onlyImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
  },
  messageContainer: {
    maxWidth: "75%",
  },
  imageModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
