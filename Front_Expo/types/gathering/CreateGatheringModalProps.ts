import { GatheringCategory } from "./GatheringCategory";

export interface CreateGatheringModalProps {
  isModalOpen: boolean;
  closeAndResetModal: () => void;
  category: GatheringCategory;
  setCategory: (val: GatheringCategory) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  selectedDateStr: string;
  handleDayPress: (day: any) => void;
  selectedHour: number;
  setSelectedHour: (h: number) => void;
  selectedMinute: number;
  setSelectedMinute: (m: number) => void;
  maxPeople: string;
  setMaxPeople: (val: string) => void;
  createGatheringPending: boolean;
  handleCreateGathering: () => void;
  t: any;
  styles: any;
}
