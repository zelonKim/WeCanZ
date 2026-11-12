import { getLocales } from "expo-localization";

const translations = {
  ko: {
    modalTitle: "참가자 노쇼 체크",
    defaultUser: "참가자",
    noShowBadge: "노쇼 처리됨",
    yesShowBadge: "예스쇼 처리됨",
    noShowBtn: "노쇼 처리",
    completeCheckBtn: "체크 완료",
    alerts: {
      title: "노쇼 처리",
      message: (nickname: string) => `${nickname} 님을 노쇼 처리하시겠습니까?`,
      cancel: "취소",
      confirm: "확인",
    },
  },
  en: {
    modalTitle: "Participant No-Show Check",
    defaultUser: "Participant",
    noShowBadge: "No-Show",
    yesShowBadge: "Yes-Show",
    noShowBtn: "No-Show",
    completeCheckBtn: "Complete Check",
    alerts: {
      title: "No-Show Processing",
      message: (nickname: string) => `Are you sure you want to process ${nickname} as a no-show?`,
      cancel: "Cancel",
      confirm: "Confirm",
    },
  },
};

export const useNoShowModalLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};