import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "프로필 보기",
    defaultBio: "등록된 자기소개가 없습니다.",
    yesShow: "예스쇼",
    noShow: "노쇼",
    joinDate: "가입일",
    back: "뒤로가기",
    notUserInfo: "유저 정보를 불러올 수 없습니다.",
  },
  en: {
    headerTitle: "View Profile",
    defaultBio: "No bio written yet.",
    yesShow: "Yes-Show",
    noShow: "No-Show",
    joinDate: "Joined",
    back: "Back",
    notUserInfo: "Can`t find user info.",
  },
};

export const useProfileLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
