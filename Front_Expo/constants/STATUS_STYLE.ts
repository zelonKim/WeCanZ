import { GatheringStatus } from "@/types/gathering/GatheringStatus";
import { StyleSheet } from "react-native";
import Colors from "./Colors";

export const STATUS_STYLE = (
  t: any,
): Partial<
  Record<GatheringStatus, { label: string; badgeStyle: any; textStyle: any }>
> => ({
  OPEN: {
    label: t.statusOpen,
    badgeStyle: styles.statusOpen,
    textStyle: styles.statusOpenText,
  },
  FULL: {
    label: t.statusFull,
    badgeStyle: styles.statusFull,
    textStyle: styles.statusFullText,
  },
  IN_PROGRESS: {
    label: t.statusInProgress,
    badgeStyle: styles.statusInProgress,
    textStyle: styles.statusInProgressText,
  },
  COMPLETED: {
    label: t.statusCompleted,
    badgeStyle: styles.statusInCompleted,
    textStyle: styles.statusInCompletedText,
  },
});

/////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  statusOpen: {
    backgroundColor: Colors.green,
  },
  statusOpenText: {
    color: Colors.background,
  },
  statusFull: {
    backgroundColor: "#fb2c36",
  },
  statusFullText: {
    color: "white",
  },
  statusInProgress: {
    backgroundColor: "#fb2c36",
  },
  statusInProgressText: {
    color: "white",
  },
  statusInCompleted: {
    backgroundColor: "#364153",
  },
  statusInCompletedText: {
    color: "white",
  },
});
