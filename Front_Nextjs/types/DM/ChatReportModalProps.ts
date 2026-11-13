import { ReportReason } from "../user/ReportReason";

export interface DmReportModalProps {
  visible: boolean;
  onClose: () => void;
  partnerName?: string;
  selectedReason: ReportReason;
  onSelectReason: (reason: ReportReason) => void;
  reportDetails: string;
  onChangeDetails: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  Colors: any;
  styles: any;
}
