import { Participant } from "../user/Participant";

export interface NoShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  meId?: string;
  noShowMutation: (participantId: string) => void;
  handleCompleteCheck: () => void;
  styles: any;
}