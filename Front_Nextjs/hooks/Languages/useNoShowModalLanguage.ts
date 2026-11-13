import { useEffect, useState } from "react";

const translations = {
  ko: {
    modalTitle: "참가자 노쇼 체크",
    defaultUser: "참가자",
    noShowBadge: "노쇼 처리됨",
    yesShowBadge: "예스쇼 처리됨",
    noShowBtn: "노쇼 처리",
    completeCheckBtn: "체크 완료",
    alerts: {
      title: "노쇼 처리",
      message: (nickname: string) => `${nickname} 님을 노쇼 처리하시겠습니까?`,
      cancel: "취소",
      confirm: "확인",
    },
  },
  en: {
    modalTitle: "Participant No-Show Check",
    defaultUser: "Participant",
    noShowBadge: "No-Show",
    yesShowBadge: "Yes-Show",
    noShowBtn: "No-Show",
    completeCheckBtn: "Complete Check",
    alerts: {
      title: "No-Show Processing",
      message: (nickname: string) =>
        `Are you sure you want to process ${nickname} as a no-show?`,
      cancel: "Cancel",
      confirm: "Confirm",
    },
  },
};

export const useNoShowModalLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"ko" | "en">("ko");

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
