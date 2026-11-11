import { ReportReason } from "@/types/user/ReportReason";
import { getLocales } from "expo-localization";

const translations = {
  ko: {
    reportModalTitle: "🚨 신고하기",
    reportTargetLabel: "유저 닉네임",
    reportTargetPlaceholder: "상대방 닉네임을 입력해주세요",
    reportReasonLabel: "신고 사유 선택",
    reportDetailsLabel: "상세 내용",
    reportDetailsPlaceholder: "신고 사유에 대한 상세 내용을 적어주세요.",
    reportSubmitButton: "접수하기",
    reportReasonLabels: {
      [ReportReason.SPAM]: "스팸 / 홍보성 내용",
      [ReportReason.INAPPROPRIATE]: "부적절한 콘텐츠",
      [ReportReason.ABUSE]: "욕설 / 비하 / 괴롭힘",
      [ReportReason.IMPERSONATION]: "사칭 / 사기",
      [ReportReason.OTHER]: "기타 사유",
    },
  },
  en: {
    reportModalTitle: "🚨 Report",
    reportTargetLabel: "User Nickname",
    reportTargetPlaceholder: "Enter partner's nickname",
    reportReasonLabel: "Select Report Reason",
    reportDetailsLabel: "Details",
    reportDetailsPlaceholder: "Please enter details about the report reason.",
    reportSubmitButton: "Submit",
    reportReasonLabels: {
      [ReportReason.SPAM]: "Spam / Ads",
      [ReportReason.INAPPROPRIATE]: "Inappropriate Content",
      [ReportReason.ABUSE]: "Abuse / Harassment",
      [ReportReason.IMPERSONATION]: "Impersonation",
      [ReportReason.OTHER]: "Other",
    },
  },
};

export const useReportLanguage = () => {
  const deviceLang = getLocales()[0]?.languageCode ?? "en";
  const currentLang = deviceLang === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return t;
};
