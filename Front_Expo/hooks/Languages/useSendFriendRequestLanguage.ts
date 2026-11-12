import { getLocales } from "expo-localization";

const translations = {
  ko: {
    alerts: {
      success: "성공",
      error: "오류",
      friendRequestSuccess: "친구 요청을 보냈습니다.",
      friendRequestFail: "친구 신청에 실패했습니다.",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      friendRequestSuccess: "Friend request sent.",
      friendRequestFail: "Failed to send friend request.",
    },
  },
};

export const useSendFriendRequestLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
