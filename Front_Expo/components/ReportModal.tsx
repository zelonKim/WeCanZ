import Colors from "@/constants/Colors";
import { useReportLanguage } from "@/hooks/Languages/useReportLanguage";
import { ReportModalProps } from "@/types/user/ReportModalProps";
import { ReportReason } from "@/types/user/ReportReason";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export const ReportModal = ({
  visible,
  onClose,
  targetNickname,
  onChangeTargetNickname,
  selectedReason,
  onSelectReason,
  reportDetails,
  onChangeReportDetails,
  onSubmit,
  isSubmitting,
  isEditable = true,
}: ReportModalProps) => {
  const t = useReportLanguage();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={"padding"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 95}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.reportModalTitle}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* 스크롤 영역 (인풋 및 칩들) */}
            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* 신고 대상 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.reportTargetLabel}</Text>
                <TextInput
                  style={[
                    styles.input,
                    !isEditable && {
                      backgroundColor: "#242426",
                      color: "#edebeb",
                    },
                  ]}
                  value={targetNickname}
                  onChangeText={onChangeTargetNickname}
                  editable={isEditable}
                  placeholder={t.reportTargetPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                />
              </View>

              {/* 신고 사유 선택 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.reportReasonLabel}</Text>
                <View style={styles.chipContainer}>
                  {Object.values(ReportReason).map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onSelectReason(reason)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {t.reportReasonLabels[reason]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 상세 내용 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.reportDetailsLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={reportDetails}
                  onChangeText={onChangeReportDetails}
                  placeholder={t.reportDetailsPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                  multiline
                />
              </View>
            </ScrollView>

            {/* 제출 버튼 (하단 고정) */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: Colors.red }]}
              onPress={onSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[styles.saveButtonText, { color: "#FFFFFF" }]}>
                  {t.reportSubmitButton}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    width: "100%",
    maxHeight: "90%",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeBtn: {
    padding: 4,
  },
  modalScrollBody: {
    maxHeight: 800,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginVertical: 8,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.tabIconDefault,
  },
  input: {
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
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
});
