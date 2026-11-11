import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "밋업 상세 정보",
    chatButton: "채팅방",
    completedBanner: "종료된 모임입니다",
    canceledBanner: "취소된 모임입니다",
    checkNoShow: "노쇼 체크하기",
    edit: "수정",
    report: "신고",
    participantCount: "참여 인원:",
    peopleUnit: "명",
    roomCode: "룸 코드",
    management: "모임 관리",
    start: "시작하기",
    cancel: "취소하기",
    finish: "종료하기 👋",

    statusLabels: {
      OPEN: "모집중",
      FULL: "마감",
      IN_PROGRESS: "진행중",
      COMPLETED: "종료됨",
      CANCELED: "취소됨",
    },
    categoryLabels: {
      US: "🇺🇸 미국",
      UK: "🇬🇧 영국",
      KR: "🇰🇷 한국",
    },

    approvedTitle: "참가자",
    emptyApproved: "참가 승인된 멤버가 없습니다.",
    pendingTitle: "대기자",
    emptyPending: "대기 중인 멤버가 없습니다.",

    apply: "참여 신청하기",
    cancelApply: "밋업 참여 취소하기",

    alerts: {
      accessDeniedTitle: "입장 불가",
      accessDeniedMsg: "승인된 참가자만 입장할 수 있습니다.",
      startTitle: "모임 시작 🚀",
      startMsg: "정말로 모임을 시작하시겠습니까?",
      cancelTitle: "모임 취소",
      cancelMsg: "정말로 모임을 취소하시겠습니까?",
      finishTitle: "모임 종료 👋",
      finishMsg: "정말로 모임을 종료하시겠습니까?",
      cancelApplyTitle: "참여 취소",
      cancelApplyMsg: "정말 밋업 참여를 취소하시겠습니까?",
      yes: "네",
      no: "아니오",
    },
  },
  en: {
    headerTitle: "Gathering Details",
    chatButton: "Chat",
    completedBanner: "This gathering has ended",
    canceledBanner: "This gathering is canceled",
    checkNoShow: "Check No-Show",
    edit: "Edit",
    report: "Report",
    participantCount: "Participants:",
    peopleUnit: "",
    roomCode: "Room Code",
    management: "Management",
    start: "Start",
    cancel: "Cancel",
    finish: "Finish 👋",

    statusLabels: {
      OPEN: "Open",
      FULL: "Full",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELED: "Canceled",
    },
    categoryLabels: {
      US: "🇺🇸 US",
      UK: "🇬🇧 UK",
      KR: "🇰🇷 KR",
    },

    approvedTitle: "Approved Participants",
    emptyApproved: "No approved participants yet.",
    pendingTitle: "Waiting List",
    emptyPending: "No waiting participants.",

    apply: "Apply to Join",
    cancelApply: "Cancel Application",

    alerts: {
      accessDeniedTitle: "Access Denied",
      accessDeniedMsg: "Only approved participants can enter.",
      startTitle: "Start Gathering 🚀",
      startMsg: "Are you sure you want to start this gathering?",
      cancelTitle: "Cancel Gathering",
      cancelMsg: "Are you sure you want to cancel this gathering?",
      finishTitle: "Finish Gathering 👋",
      finishMsg: "Are you sure you want to finish this gathering?",
      cancelApplyTitle: "Cancel Application",
      cancelApplyMsg: "Are you sure you want to cancel your application?",
      yes: "Yes",
      no: "No",
    },
  },
};

export const useGatheringDetailLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
