import { getLocales } from "expo-localization";

const translations = {
  ko: {
    title: "거의 다 완료됐어요",
    subtitle: "서비스 이용을 위해서는 닉네임과 유저 동의가 필요해요.",
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "최소 2자 이상 입력",
    allAgree: "전체 동의하기",
    termsAgree: "[필수] 서비스 이용약관 동의",
    privacyAgree: "[필수] 개인정보 처리방침 동의",
    marketingAgree: "[선택] 마케팅 정보 수신 동의",
    viewLink: "보기",
    startBtn: "시작하기",
    alerts: {
      warning: "경고",
      nicknameRequired: "사용하실 닉네임을 입력해 주세요.",
      termsRequired: "필수 약관에 모두 동의해 주세요.",
      defaultError: "처리 중 오류가 발생했습니다.",
    },
  },
  en: {
    title: "Almost Done!",
    subtitle: "Please enter your nickname and agree to the terms to continue.",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "At least 2 characters",
    allAgree: "Agree to All",
    termsAgree: "[Required] Terms of Service Agreement",
    privacyAgree: "[Required] Privacy Policy Agreement",
    marketingAgree: "[Optional] Marketing Information Consent",
    viewLink: "View",
    startBtn: "Get Started",
    alerts: {
      warning: "Warning",
      nicknameRequired: "Please enter a nickname to use.",
      termsRequired: "Please agree to all required terms.",
      defaultError: "An error occurred while processing.",
    },
  },
};

export const useAgreementLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};