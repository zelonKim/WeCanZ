import { ReportReason } from "@/types/user/ReportReason";
import { useEffect, useState } from "react";

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
      [ReportReason.SPAM]: "Spam / Advertisement ",
      [ReportReason.INAPPROPRIATE]: "Inappropriate Content",
      [ReportReason.ABUSE]: "Abuse / Harassment",
      [ReportReason.IMPERSONATION]: "Impersonation",
      [ReportReason.OTHER]: "Other",
    },
  },
};

export const useReportLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"ko" | "en">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language || navigator.languages[0];
      const langCode = browserLang.toLowerCase().startsWith("ko") ? "ko" : "en";
      setCurrentLang(langCode);
    }
  }, []);

  const t = translations[currentLang] || translations.en;

  return { t, currentLang };
};
