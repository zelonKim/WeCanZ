import { useReportLanguage } from "@/hooks/Languages/useReportLanguage";
import { DmReportModalProps } from "@/types/DM/ChatReportModalProps";
import { ReportReason } from "@/types/user/ReportReason";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const DmReportModal = ({
  visible,
  onClose,
  partnerName,
  selectedReason,
  onSelectReason,
  reportDetails,
  onChangeDetails,
  onSubmit,
  isSubmitting,
  Colors,
  styles,
}: DmReportModalProps) => {
  const t = useReportLanguage();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={"padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : -40}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.reportModalTitle}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t.reportTargetLabel}</Text>
              <TextInput
                style={styles.ReportInput}
                value={partnerName}
                editable={false}
                placeholder={t.reportTargetPlaceholder}
                placeholderTextColor={Colors.tabIconDefault}
              />

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

              <Text style={styles.inputLabel}>{t.reportDetailsLabel}</Text>
              <TextInput
                style={[styles.ReportInput, styles.textArea]}
                value={reportDetails}
                onChangeText={onChangeDetails}
                placeholder={t.reportDetailsPlaceholder}
                placeholderTextColor={Colors.tabIconDefault}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: Colors.red }]}
              onPress={onSubmit}
              disabled={isSubmitting}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
