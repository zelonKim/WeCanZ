import { useEffect, useState } from "react";

const translations = {
  ko: {
    subText: "우리도 주말에 Gen-Z가 될 수 있어요",
    idPlaceholder: "아이디",
    passwordPlaceholder: "비밀번호",
    loginBtn: "로그인",
    waitLogin: "로그인 중...",
    signupPrompt: "아직 계정이 없으신가요?",
    signupLink: "회원가입",
    dividerText: "간편 로그인",
    googleLoginBtn: "Google로 로그인",
    appleLoginBtn: "Apple로 로그인",
    termsOfService: "서비스 이용약관",
    privacyPolicy: "개인정보 처리방침",
    alerts: {
      appleUnsupported: "안내",
      appleUnsupportedMsg: "Apple 로그인은 iOS기기에서만 지원됩니다.",
      appleTokenError: "오류",
      appleTokenErrorMsg: "애플 인증 토큰을 가져오지 못했습니다.",
      appleLoginErrorMsg: "애플 로그인 중 문제가 발생했습니다.",

      googleTokenErrorMsg: "구글 인증 토큰을 가져오지 못했습니다.",
      playServicesErrorMsg: "Google Play Services를 사용할 수 없습니다.",
      googleLoginErrorMsg: "구글 로그인 중 문제가 발생했습니다.",

      socialLoginErrorMsg: "소셜 로그인 중 오류가 발생했습니다.",
      defaultErrorMsg: "오류가 발생했습니다.",

      idRequired: "아이디를 입력해 주세요.",
      pwRequired: "비밀번호를 입력해 주세요.",
      warning: "경고",
      error: "오류",
    },
  },
  en: {
    subText: "We Can be Gen-Z on weekends",
    idPlaceholder: "ID",
    passwordPlaceholder: "Password",
    loginBtn: "Log In",
    waitLogin: "Logging in...",
    signupPrompt: "Don't have an account?",
    signupLink: "Sign Up",
    dividerText: "Social Login",
    googleLoginBtn: "Sign in with Google",
    appleLoginBtn: "Sign in with Apple",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    alerts: {
      appleUnsupported: "Notice",
      appleUnsupportedMsg: "Apple Sign-In is only supported on iOS devices.",
      appleTokenError: "Error",
      appleTokenErrorMsg: "Failed to fetch Apple authentication token.",
      appleLoginErrorMsg: "An error occurred during Apple Sign-In.",

      googleTokenErrorMsg: "Failed to fetch Google authentication token.",
      playServicesErrorMsg: "Google Play Services is not available.",
      googleLoginErrorMsg: "An error occurred during Google Sign-In.",

      socialLoginErrorMsg: "An error occurred during social login.",
      defaultErrorMsg: "An error occurred.",

      idRequired: "Please enter your ID.",
      pwRequired: "Please enter your password.",
      warning: "Warning",
      error: "Error",
    },
  },
};

export const useLoginLanguage = () => {
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
