import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "프로필 보기",
    defaultBio: "등록된 자기소개가 없습니다.",
    yesShow: "예스쇼",
    noShow: "노쇼",
    joinDate: "가입일",
  },
  en: {
    headerTitle: "View Profile",
    defaultBio: "No bio written yet.",
    yesShow: "Yes-Show",
    noShow: "No-Show",
    joinDate: "Joined",
  },
};

export const useProfileLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t };
};
