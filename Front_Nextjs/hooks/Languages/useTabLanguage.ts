import { useEffect, useState } from "react";

const translations = {
  ko: {
    friend: "친구",
    dm: "DM",
    spot: "스팟",
    meetup: "밋업",
    flash: "참여",
    setting: "설정",
  },
  en: {
    friend: "Friends",
    dm: "DM",
    spot: "Spot",
    meetup: "Meetup",
    flash: "Joined",
    setting: "Settings",
  },
};

export const useTabLanguage = () => {
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
