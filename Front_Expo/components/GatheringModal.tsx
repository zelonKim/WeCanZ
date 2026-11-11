import { CALENDAR_THEME } from "@/constants/CALENDAR_THEME";
import Colors from "@/constants/Colors";
import { HOURS } from "@/constants/HOURS";
import { MINUTES } from "@/constants/MINUTES";
import { useGatheringModalLanguage } from "@/hooks/Languages/useGatheringModalLanguage";
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
import { Calendar, DateData } from "react-native-calendars";
import { CategorySelector } from "./CategorySelector";
import { TimePickerSection } from "./TimePickerSection";

interface GatheringModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  category: GatheringCategory;
  setCategory: (category: GatheringCategory) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  selectedDateStr: string;
  selectedHour: number;
  setSelectedHour: (hour: number) => void;
  selectedMinute: number;
  setSelectedMinute: (minute: number) => void;
  maxPeople: number | string;
  setMaxPeople: (people: any) => void;
  onSubmit: () => void;
  isPending: boolean;
  handleDayPress: (day: DateData) => void;
  styles: any;
}

export const GatheringModal: React.FC<GatheringModalProps> = ({
  mode,
  isOpen,
  onClose,
  category,
  setCategory,
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  selectedDateStr,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
  maxPeople,
  setMaxPeople,
  onSubmit,
  isPending,
  handleDayPress,
  styles,
}) => {
  const { t, currentLang } = useGatheringModalLanguage();

  const markedDates = useMemo(
    () => ({
      [selectedDateStr]: {
        selected: true,
        selectedColor: Colors.green,
        selectedTextColor: Colors.background,
      },
    }),
    [selectedDateStr, Colors],
  );

  const categoryOptions = useMemo(
    () => [
      { label: t.us, value: GatheringCategory.US },
      { label: t.uk, value: GatheringCategory.UK },
      { label: t.kr, value: GatheringCategory.KR },
    ],
    [t],
  );

  const modalTitle = mode === "create" ? t.newMeetup : t.editMeetup;
  const submitButtonText = mode === "create" ? t.createBtn : t.editBtn;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -32}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.text} />
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
                  placeholderTextColor={Colors.tabIconDefault}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>{t.descLabel}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t.descPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.inputLabel}>{t.locationLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.locationPlaceholder}
                  placeholderTextColor={Colors.tabIconDefault}
                  value={location}
                  onChangeText={setLocation}
                />

                <Text style={styles.inputLabel}>{t.dateLabel}</Text>
                <Calendar
                  current={selectedDateStr}
                  minDate={getTodayString()}
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={CALENDAR_THEME()}
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
                    hour: t.hour,
                    minute: t.minute,
                  }}
                  styles={styles}
                />

                <Text style={styles.inputLabel}>{t.maxPeopleLabel}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(maxPeople ?? "")}
                  onChangeText={setMaxPeople}
                />
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmit}
                disabled={isPending}
                activeOpacity={0.8}
              >
                {isPending ? (
                  <ActivityIndicator
                    color={mode === "create" ? "#000000" : "#FFFFFF"}
                  />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {submitButtonText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
