import { useEffect, useState } from "react";

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
