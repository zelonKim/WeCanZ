import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "밋업 히스토리",
    completedTab: "종료된 밋업",
    canceledTab: "취소된 밋업",
    noDescription: "상세 내용이 없습니다.",
    noLocation: "장소 미정",
    emptyCompleted: "종료된 모임이 없습니다.",
    emptyCanceled: "취소된 모임이 없습니다.",
  },
  en: {
    headerTitle: "Meetup History",
    completedTab: "Completed",
    canceledTab: "Canceled",
    noDescription: "No description provided.",
    noLocation: "Location TBD",
    emptyCompleted: "No completed meetups found.",
    emptyCanceled: "No canceled meetups found.",
  },
};

export const useMeetupHistoryLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};