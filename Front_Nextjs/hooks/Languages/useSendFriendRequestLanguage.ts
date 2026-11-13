import { useEffect, useState } from "react";

const translations = {
  ko: {
    alerts: {
      success: "성공",
      error: "오류",
      friendRequestSuccess: "친구 요청을 보냈습니다.",
      friendRequestFail: "친구 신청에 실패했습니다.",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      friendRequestSuccess: "Friend request sent.",
      friendRequestFail: "Failed to send friend request.",
    },
  },
};

export const useSendFriendRequestLanguage = () => {
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
