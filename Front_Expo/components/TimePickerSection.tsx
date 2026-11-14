import { TimePickerSectionProps } from "@/types/gathering/TimePickerSectionProps";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  selectedHour,
  selectedMinute,
  onSelectHour,
  onSelectMinute,
  hours,
  minutes,
  labels,
  styles,
}) => (
  <>
    <Text style={styles.inputLabel}>{labels.time}</Text>
    <View style={styles.clockDisplayContainer}>
      <Text style={styles.clockDisplayText}>
        {String(selectedHour).padStart(2, "0")} :{" "}
        {String(selectedMinute).padStart(2, "0")}
      </Text>
    </View>

    <Text style={styles.subInputLabel}>{labels.hour}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.timeChipScroll}
    >
      {hours.map((h) => (
        <TouchableOpacity
          key={h}
          style={[styles.timeChip, selectedHour === h && styles.timeChipActive]}
          onPress={() => onSelectHour(h)}
        >
          <Text
            style={[
              styles.timeChipText,
              selectedHour === h && styles.timeChipTextActive,
            ]}
          >
            {String(h).padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <Text style={styles.subInputLabel}>{labels.minute}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.timeChipScroll}
    >
      {minutes.map((m) => (
        <TouchableOpacity
          key={m}
          style={[
            styles.timeChip,
            selectedMinute === m && styles.timeChipActive,
          ]}
          onPress={() => onSelectMinute(m)}
        >
          <Text
            style={[
              styles.timeChipText,
              selectedMinute === m && styles.timeChipTextActive,
            ]}
          >
            {String(m).padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
);
