import { getLocales } from "expo-localization";

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
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
