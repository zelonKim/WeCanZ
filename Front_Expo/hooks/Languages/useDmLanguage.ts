import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "DM",
    pendingHeader: (count: number) => `받은 DM 요청 (${count})`,
    emptyPending: "받은 DM 요청이 없습니다.",
    accept: "수락",
    reject: "거절",
    roomsHeader: (count: number) => `대화 중인 DM (${count})`,
    emptyRooms: "참여 중인 DM 대화방이 없습니다.",

    modalTitle: "✉️ DM 요청",
    modalSubtitle: "DM을 요청할 유저의 닉네임을 입력해주세요.",
    nicknamePlaceholder: "닉네임 입력",
    cancel: "취소",
    sendRequest: "요청 보내기",

    alerts: {
      success: "성공",
      notice: "알림",
      error: "오류",
      acceptSuccess: "DM 요청을 수락했습니다.",
      acceptFail: "수락에 실패했습니다.",
      rejectSuccess: "DM 요청을 거절했습니다.",
      rejectFail: "거절에 실패했습니다.",
      requestSent: "DM 요청을 보냈습니다.",
      requestFail: "DM 요청에 실패했습니다.",
      emptyNickname: "상대방 닉네임을 입력해주세요.",
      searchFail: "존재하지 않거나 검색할 수 없는 유저입니다.",
      leaveFail: "방 나가기에 실패했습니다.",

      leaveAlertTitle: "나가기",
      leaveAlertMsg: "정말 메시지방을 삭제하고 나가시겠습니까?",
      leaveAction: "나가기",
    },
  },
  en: {
    headerTitle: "DM",
    pendingHeader: (count: number) => `DM Requests (${count})`,
    emptyPending: "No pending DM requests.",
    accept: "Accept",
    reject: "Reject",
    roomsHeader: (count: number) => `My DMs (${count})`,
    emptyRooms: "No active DM chat rooms.",

    modalTitle: "✉️ DM Request",
    modalSubtitle: "Enter the nickname of the user you want to message.",
    nicknamePlaceholder: "Enter nickname",
    cancel: "Cancel",
    sendRequest: "Send Request",

    alerts: {
      success: "Success",
      notice: "Notice",
      error: "Error",
      acceptSuccess: "Accepted the DM request.",
      acceptFail: "Failed to accept.",
      rejectSuccess: "Rejected the DM request.",
      rejectFail: "Failed to reject.",
      requestSent: "DM request sent.",
      requestFail: "Failed to send DM request.",
      emptyNickname: "Please enter the recipient's nickname.",
      searchFail: "User does not exist or cannot be found.",
      leaveFail: "Failed to leave the chat room.",

      leaveAlertTitle: "Leave Room",
      leaveAlertMsg:
        "Are you sure you want to delete and leave this chat room?",
      leaveAction: "Leave",
    },
  },
};

export const useDmLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
