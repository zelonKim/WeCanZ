import { getLocales } from "expo-localization";

const translations = {
  ko: {
    menu: {
      viewProfile: "프로필 보기",
      friendRequest: "친구 요청",
      requestDm: "DM 요청",
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
      requestDm: "DM Request",
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

export const useGatheringChatMenuLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};