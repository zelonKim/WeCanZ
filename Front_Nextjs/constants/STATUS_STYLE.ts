import { GatheringStatus } from "@/types/gathering/GatheringStatus";

export interface StatusStyleConfig {
  label: string;
  className: string;
}

export const STATUS_STYLE = (
  t: Record<string, string>,
): Partial<Record<GatheringStatus, StatusStyleConfig>> => ({
  OPEN: {
    label: t.statusOpen,
    className: "bg-[#bef408] text-[#121212]",
  },
  FULL: {
    label: t.statusFull,
    className: "bg-orange-600 text-white",
  },
  IN_PROGRESS: {
    label: t.statusInProgress,
    className: "bg-emerald-600 text-white",
  },
  COMPLETED: {
    label: t.statusCompleted,
    className: "bg-[#364153] text-white",
  },
});
