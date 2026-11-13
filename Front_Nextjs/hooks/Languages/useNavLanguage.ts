import { useEffect, useState } from "react";

const translations = {
  ko: {
    friend: "친구",
    dm: "DM",
    spot: "스팟",
    meetup: "밋업",
    join: "참여",
    setting: "설정",
  },
  en: {
    friend: "Friend",
    dm: "DM",
    spot: "Spot",
    meetup: "Meetup",
    join: "Join",
    setting: "Settings",
  },
};

export const useNavLanguage = () => {
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