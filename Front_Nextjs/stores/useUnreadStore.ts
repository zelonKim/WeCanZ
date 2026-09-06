import { create } from "zustand";

interface UnreadState {
  unreadGatheringIds: string[];
  setUnreadGatherings: (ids: string[]) => void;
  addUnreadGathering: (gatheringId: string) => void;
  removeUnreadGathering: (gatheringId: string) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadGatheringIds: [],

  setUnreadGatherings: (ids) => set({ unreadGatheringIds: ids }),

  addUnreadGathering: (id) =>
    set((state) => ({
      unreadGatheringIds: state.unreadGatheringIds.includes(id)
        ? state.unreadGatheringIds
        : [...state.unreadGatheringIds, id],
    })),

  removeUnreadGathering: (id) =>
    set((state) => ({
      unreadGatheringIds: state.unreadGatheringIds.filter((gId) => gId !== id),
    })),
}));
