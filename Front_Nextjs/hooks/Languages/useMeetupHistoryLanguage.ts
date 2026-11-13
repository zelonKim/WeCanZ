import { useEffect, useState } from "react";

const translations = {
  ko: {
    headerTitle: "밋업 히스토리",
    completedTab: "종료된 밋업",
    canceledTab: "취소된 밋업",
    noDescription: "상세 내용이 없습니다.",
    noLocation: "장소 미정",
    emptyCompleted: "종료된 모임이 없습니다.",
    emptyCanceled: "취소된 모임이 없습니다.",
  },
  en: {
    headerTitle: "Meetup History",
    completedTab: "Completed",
    canceledTab: "Canceled",
    noDescription: "No description provided.",
    noLocation: "Location TBD",
    emptyCompleted: "No completed meetups found.",
    emptyCanceled: "No canceled meetups found.",
  },
};

export const useMeetupHistoryLanguage = () => {
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
