import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DMScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 다이렉트 메시지</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          참여 확정된 번개 모임 단톡방 목록이 노출됩니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 15, color: "#8E8E93" },
});
