export const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  OPEN: {
    bg: "bg-[#bef408]/15",
    text: "text-[#bef408]",
  },
  FULL: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
  },
  IN_PROGRESS: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
  },
  COMPLETED: {
    bg: "bg-zinc-800",
    text: "text-zinc-400",
  },
  CANCELED: {
    bg: "bg-red-500/15",
    text: "text-red-400",
  },
};
