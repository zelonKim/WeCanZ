import { CALENDAR_THEME } from "@/constants/CALENDAR_THEME";
import Colors from "@/constants/Colors";
import { HOURS } from "@/constants/HOURS";
import { MINUTES } from "@/constants/MINUTES";
import { CreateGatheringModalProps } from "@/types/gathering/CreateGatheringModalProps";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
import { getTodayString } from "@/utils/getTodayString";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { CategorySelector } from "./CategorySelector";
import { TimePickerSection } from "./TimePickerSection";

export const CreateGatheringModal: React.FC<CreateGatheringModalProps> = ({
  isModalOpen,
  closeAndResetModal,
  category,
  setCategory,
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  selectedDateStr,
  handleDayPress,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
  maxPeople,
  setMaxPeople,
  createGatheringPending,
  handleCreateGathering,
  t,

  styles,
}) => {
  const markedDates = useMemo(
    () => ({
      [selectedDateStr]: {
        selected: true,
        selectedColor: Colors.green,
        selectedTextColor: "#000000",
      },
    }),
    [selectedDateStr, Colors.green],
  );

  const categoryOptions = useMemo(
    () => [
      { label: t.us, value: GatheringCategory.US },
      { label: t.uk, value: GatheringCategory.UK },
      { label: t.kr, value: GatheringCategory.KR },
    ],
    [t, GatheringCategory],
  );

  return (
    <Modal
      visible={isModalOpen}
      animationType="slide"
      transparent
      onRequestClose={closeAndResetModal}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* 모달 헤더 */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.newMeetup}</Text>
                <TouchableOpacity
                  onPress={closeAndResetModal}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                <CategorySelector
                  category={category}
                  onSelectCategory={setCategory}
                  options={categoryOptions}
                  label={t.categoryLabel}
                />

                <Text style={styles.inputLabel}>{t.titleLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.titlePlaceholder}
                  placeholderTextColor="#666668"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>{t.descLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t.descPlaceholder}
                  placeholderTextColor="#666668"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.inputLabel}>{t.locationLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.locationPlaceholder}
                  placeholderTextColor="#666668"
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.inputLabel}>{t.dateLabel}</Text>
                <Calendar
                  current={selectedDateStr}
                  minDate={getTodayString()}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={CALENDAR_THEME(Colors)}
                  style={styles.inlineCalendar}
                />

                <TimePickerSection
                  selectedHour={selectedHour}
                  selectedMinute={selectedMinute}
                  onSelectHour={setSelectedHour}
                  onSelectMinute={setSelectedMinute}
                  hours={HOURS}
                  minutes={MINUTES}
                  labels={{
                    time: t.timeLabel,
                    hour: t.hourLabel,
                    minute: t.minuteLabel,
                  }}
                  styles={styles}
                />

                <Text style={styles.inputLabel}>{t.maxPeopleLabel}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={maxPeople}
                  onChangeText={setMaxPeople}
                />
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateGathering}
                disabled={createGatheringPending}
                activeOpacity={0.8}
              >
                {createGatheringPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitButtonText}>{t.createBtn}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
