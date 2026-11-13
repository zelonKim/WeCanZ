import { useEffect, useState } from "react";

const translations = {
  ko: {
    alerts: {
      success: "성공",
      error: "오류",
      blockSuccess: "해당 유저를 차단했습니다.",
      blockFail: "유저 차단에 실패했습니다.",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      blockSuccess: "User has been blocked.",
      blockFail: "Failed to block user.",
    },
  },
};

export const useBlockUserLanguage = () => {
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
