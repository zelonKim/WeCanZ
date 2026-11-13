import Colors from "@/constants/Colors";
import { CategorySelectorProps } from "@/types/gathering/CategorySelectorProps";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  onSelectCategory,
  options,
  label,
}) => (
  <>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.categorySelectRow}>
      {options.map((item) => {
        const isActive = category === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.modalCategoryChip,
              isActive && styles.modalCategoryChipActive,
            ]}
            onPress={() => onSelectCategory(item.value)}
          >
            <Text
              style={[
                styles.modalCategoryText,
                isActive && styles.modalCategoryTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </>
);

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A1A1AA",
    marginTop: 16,
    marginBottom: 8,
  },
  categorySelectRow: {
    flexDirection: "row",
    gap: 8,
  },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#27272A",
    alignItems: "center",
  },
  modalCategoryChipActive: {
    backgroundColor: Colors.green,
  },
  modalCategoryText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "700",
  },
  modalCategoryTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
});
