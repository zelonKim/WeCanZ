import { useEffect, useState } from "react";

const translations = {
  ko: {
    blockedText: "차단한 유저와는 대화할 수 없습니다.",
    placeholder: "메시지를 입력하세요...",
  },
  en: {
    blockedText: "You cannot chat with a blocked user.",
    placeholder: "Type a message...",
  },
};

export const useChatInputBarLanguage = () => {
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
