"use client";

import { useState, useEffect } from "react";

const translations = {
  ko: {
    googleLogin: "Google로 로그인",
    appleLogin: "Apple로 로그인",
    alerts: {
      googleTokenFail: "구글 인증 토큰 수령에 실패했습니다.",
      googleFail: "구글 로그인에 실패했습니다.",
    },
  },
  en: {
    googleLogin: "Sign in with Google",
    appleLogin: "Sign in with Apple",
    alerts: {
      googleTokenFail: "Failed to retrieve Google authentication token.",
      googleFail: "Google login failed.",
    },
  },
};

export const useSocialLoginLanguage = () => {
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