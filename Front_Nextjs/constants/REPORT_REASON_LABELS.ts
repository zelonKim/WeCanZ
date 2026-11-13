import { ReportReason } from "@/types/user/ReportReason";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SPAM]: "스팸 및 광고",
  [ReportReason.INAPPROPRIATE]: "부적절한 콘텐츠",
  [ReportReason.ABUSE]: "욕설 및 비방",
  [ReportReason.IMPERSONATION]: "사칭 및 허위 정보",
  [ReportReason.OTHER]: "기타 사유",
};
