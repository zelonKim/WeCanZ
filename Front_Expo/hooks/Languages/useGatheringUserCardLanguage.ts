import { getLocales } from "expo-localization";

const translations = {
  ko: {
    hostBadge: "👑 방장",
    viewProfile: "프로필 보기",
    friendRequest: "친구 요청",
    dmRequest: "DM 요청",
    block: "차단",
    stats: (yesShow: number, noShow: number) =>
      `예스쇼 ${yesShow}회  /  노쇼 ${noShow}회`,

    alerts: {
      blockTitle: "유저 차단",
      blockMsg: (nickname: string) => `${nickname}님을 차단하시겠습니까?`,
      cancel: "취소",
      blockConfirm: "차단",

      banTitle: "강퇴",
      banMsg: "해당 참가자를 강퇴하시겠습니까?",
      banConfirm: "강퇴",
    },
  },
  en: {
    hostBadge: "👑 Host",
    viewProfile: "View Profile",
    friendRequest: "Friend Request",
    dmRequest: "DM Request",
    block: "Block",
    stats: (yesShow: number, noShow: number) =>
      `Yes-Show: ${yesShow}  /  No-Show: ${noShow}`,

    alerts: {
      blockTitle: "Block User",
      blockMsg: (nickname: string) =>
        `Are you sure you want to block ${nickname}?`,
      cancel: "Cancel",
      blockConfirm: "Block",

      banTitle: "Kick Out",
      banMsg: "Are you sure you want to kick out this participant?",
      banConfirm: "Kick Out",
    },
  },
};

export const useGatheringUserCardLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
