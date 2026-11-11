import { getLocales } from "expo-localization";

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
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t };
};
