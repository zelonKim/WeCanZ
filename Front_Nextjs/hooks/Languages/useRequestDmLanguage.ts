import { useEffect, useState } from "react";

const translations = {
  ko: {
    alerts: {
      success: "성공",
      error: "오류",
      requestSent: "DM 요청을 보냈습니다.",
      requestFail: "DM 요청에 실패했습니다.",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      requestSent: "DM request sent.",
      requestFail: "Failed to send DM request.",
    },
  },
};

export const useRequestDmLanguage = () => {
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
