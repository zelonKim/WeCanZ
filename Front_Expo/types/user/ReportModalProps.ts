import { ReportReason } from "./ReportReason";

export interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetNickname: string;
  onChangeTargetNickname?: (text: string) => void;
  selectedReason: ReportReason;
  onSelectReason: (reason: ReportReason) => void;
  reportDetails: string;
  onChangeReportDetails: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditable?: boolean;
}
