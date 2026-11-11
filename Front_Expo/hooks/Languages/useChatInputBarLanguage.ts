import { getLocales } from "expo-localization";

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
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
