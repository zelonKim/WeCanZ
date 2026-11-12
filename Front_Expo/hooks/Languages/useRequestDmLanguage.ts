import { getLocales } from "expo-localization";

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
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
