import { getLocales } from "expo-localization";

const localizedNicknames = {
  ko: {
    adjectives: [
      "귀여운",
      "다정한",
      "매력적인",
      "수줍은",
      "시크한",
      "상큼한",
      "풋풋한",
      "힙한",
      "자유로운",
      "러블리한",
      "즐거운",
    ],
    nouns: [
      "메이트",
      "스위티",
      "베이비",
      "뉴페이스",
      "큐티",
      "크루",
      "바이브",
      "브로",
      "시스터",
      "걸",
      "보이",
    ],
  },
  en: {
    adjectives: [
      "Cute",
      "Friendly",
      "Charming",
      "Shy",
      "Chic",
      "Fresh",
      "Youthful",
      "Hip",
      "Free",
      "Lovely",
      "Cheerful",
    ],
    nouns: [
      "Mate",
      "Sweety",
      "Baby",
      "Newface",
      "Cutie",
      "Crew",
      "Vibe",
      "Bro",
      "Sister",
      "Girl",
      "Boy",
    ],
  },
};

const translations = {
  ko: {
    headerTitle: "회원가입",
    idLabel: "아이디",
    idPlaceholder: "최소 5자 이상 입력",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "영문 + 숫자 8자 이상 입력",
    passwordConfirmLabel: "비밀번호 확인",
    passwordConfirmPlaceholder: "비밀번호를 다시 입력하세요",
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "최소 2자 이상 입력",
    refreshNickname: "랜덤 생성",

    allAgree: "전체 동의하기",
    termsRequired: "[필수] 서비스 이용 약관 동의",
    privacyRequired: "[필수] 개인정보 처리 방침 동의",
    marketingOptional: "[선택] 마케팅 정보 수신 동의",
    viewLink: "보기",

    submitBtn: "시작하기",

    alerts: {
      notice: "알림",
      error: "오류",
      idMinLength: "아이디는 최소 5글자 이상이어야 합니다.",
      passwordRegex: "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.",
      passwordMismatch: "비밀번호가 일치하지 않습니다.",
      nicknameMinLength: "닉네임은 최소 2글자 이상이어야 합니다.",
      nicknameMaxLength: "닉네임은 최대 30글자 이하이어야 합니다.",
      termsRequiredAlert: "서비스 이용 약관에 동의해야 합니다.",
      privacyRequiredAlert: "개인정보 처리 방침에 동의해야 합니다.",
      defaultSignupError: "회원가입 중 오류가 발생했습니다.",
    },
  },
  en: {
    headerTitle: "Sign Up",
    idLabel: "ID",
    idPlaceholder: "At least 5 characters",
    passwordLabel: "Password",
    passwordPlaceholder: "8+ chars, letters & numbers",
    passwordConfirmLabel: "Confirm Password",
    passwordConfirmPlaceholder: "Re-enter your password",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "At least 2 characters",
    refreshNickname: "Random",

    allAgree: "Agree to all terms",
    termsRequired: "[Required] Terms of Service",
    privacyRequired: "[Required] Privacy Policy",
    marketingOptional: "[Optional] Marketing Information",
    viewLink: "View",

    submitBtn: "Get Started",

    alerts: {
      notice: "Notice",
      error: "Error",
      idMinLength: "ID must be at least 5 characters long.",
      passwordRegex:
        "Password must be at least 8 characters with letters and numbers.",
      passwordMismatch: "Passwords do not match.",
      nicknameMinLength: "Nickname must be at least 2 characters long.",
      nicknameMaxLength: "Nickname must be 30 characters or less.",
      termsRequiredAlert: "You must agree to the Terms of Service.",
      privacyRequiredAlert: "You must agree to the Privacy Policy.",
      defaultSignupError: "An error occurred during sign up.",
    },
  },
};

export const useSignupLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];
  const nicknames = localizedNicknames[currentLang];
  return { t, currentLang, nicknames }; 
};
