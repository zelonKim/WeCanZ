import { getLocales } from "expo-localization";

const translations = {
  ko: {
    defaultTitle: "모임 채팅방",
    participantPrefix: "참가자 ",
    participantSuffix: "명",
    emptyTitle: "아직 메시지가 없습니다.",
    emptySubText: "첫 번째 대화를 시작해 보세요!",
  },
  en: {
    defaultTitle: "Meetup Chat",
    participantPrefix: "Participants: ",
    participantSuffix: "",
    emptyTitle: "No messages yet.",
    emptySubText: "Start the first conversation!",
  },
};

export const useGatheringChatLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};