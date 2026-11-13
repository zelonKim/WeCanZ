import { useEffect, useState } from "react";

const translations = {
  ko: {
    menu: {
      viewProfile: "프로필 보기",
      friendRequest: "친구 요청",
      block: "차단",
    },
    alerts: {
      blockTitle: "유저 차단",
      blockConfirm: (name: string) => `${name}님을 차단하시겠습니까?`,
      cancel: "취소",
      block: "차단",
    },
  },
  en: {
    menu: {
      viewProfile: "View Profile",
      friendRequest: "Friend Request",
      block: "Block",
    },
    alerts: {
      blockTitle: "Block User",
      blockConfirm: (name: string) => `Are you sure you want to block ${name}?`,
      cancel: "Cancel",
      block: "Block",
    },
  },
};

export const useDmMenuPopoverLanguage = () => {
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
