import { useEffect, useState } from "react";

const translations = {
  ko: {
    defaultTitle: "모임 채팅방",
    participantPrefix: "참가자 ",
    participantSuffix: "명",
    emptyTitle: "아직 메시지가 없습니다.",
    emptySubText: "첫 번째 대화를 시작해 보세요!",


    alerts: {
      error: "오류",
      sendFailMessage: "메시지를 전송하지 못했습니다.",

      unauthorizedTitle: "권한 없음",
      unauthorizedMessage: "본인이 작성한 메시지만 삭제할 수 있습니다.",

      deleteTitle: "메시지 삭제",
      deleteMessage: "이 메시지를 삭제하시겠습니까?",
      cancel: "취소",
      delete: "삭제",

      warning: "경고",
      emptyTargetNickname: "신고할 유저의 닉네임을 입력해주세요.",
      emptyReportDetails: "상세 신고 내용을 입력해주세요.",
      userNotFound: "해당 닉네임을 가진 유저를 찾을 수 없습니다.",

      lookupFailTitle: "조회 실패",
      defaultLookupFail: "존재하지 않는 유저이거나 조회 실패했습니다.",
    },
  },
  en: {
    defaultTitle: "Meetup Chat",
    participantPrefix: "Participants: ",
    participantSuffix: "",
    emptyTitle: "No messages yet.",
    emptySubText: "Start the first conversation!",

    alerts: {
      error: "Error",
      sendFailMessage: "Failed to send message.",

      unauthorizedTitle: "Unauthorized",
      unauthorizedMessage: "You can only delete your own messages.",

      deleteTitle: "Delete Message",
      deleteMessage: "Are you sure you want to delete this message?",
      cancel: "Cancel",
      delete: "Delete",

      warning: "Warning",
      emptyTargetNickname: "Please enter the nickname of the user to report.",
      emptyReportDetails: "Please enter detailed report reasons.",
      userNotFound: "User with this nickname could not be found.",

      lookupFailTitle: "Lookup Failed",
      defaultLookupFail: "User does not exist or lookup failed.",
    },
  },
};

export const useGatheringChatLanguage = () => {
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
