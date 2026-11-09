import { ReportReason } from "./ReportReason";

export interface CreateReportDto {
  reportedUserId: string;
  reason: ReportReason;
  details: string;
}
