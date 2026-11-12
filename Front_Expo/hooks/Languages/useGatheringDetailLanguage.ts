import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "모임 상세 정보",
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
    finish: "종료하기 👏",

    statusLabels: {
      OPEN: "모임중",
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
    cancelApply: "모임 참여 취소하기",
    reportDetailsPlaceholder: "상세 신고 내용을 입력해주세요.",
    alerts: {
      accessDeniedTitle: "입장 불가",
      accessDeniedMsg: "승인된 참가자만 입장할 수 있습니다.",
      startTitle: "모임 시작 🚀",
      startMsg: "정말로 모임을 시작하시겠습니까?",
      cancelTitle: "모임 취소",
      cancelMsg: "정말로 모임을 취소하시겠습니까?",
      finishTitle: "모임 종료 👏",
      finishMsg: "정말로 모임을 종료하시겠습니까?",
      cancelApplyTitle: "참여 취소",
      cancelApplyMsg: "정말 모임 참여를 취소하시겠습니까?",
      yes: "네",
      no: "아니오",
      userNotFound: "존재하지 않는 유저 입니다.",

      success: "성공",
      error: "오류",
      warning: "경고",

      editSuccess: "모임이 수정되었습니다!",
      editFail: "모임 수정에 실패했습니다.",

      emptyTitle: "제목을 입력해주세요.",
      emptyDescription: "설명을 입력해주세요.",
      emptyLocation: "모임 장소를 입력해주세요.",
      invalidMaxPeople: "올바른 정원 숫자를 입력해주세요.",

      applySuccess: "참여 신청이 완료되었습니다.",
      applyFail: "신청 실패",

      cancelApplySuccess: "참여 신청이 취소되었습니다.",
      cancelApplyFail: "취소 실패",

      approveSuccess: "참가자로 승인되었습니다.",
      approveFail: "승인 실패",

      pendingSuccess: "대기 상태로 변경되었습니다.",
      pendingFail: "상태 변경 실패",

      banSuccess: "강퇴 처리되었습니다.",
      banFail: "강퇴 실패",

      startSuccess: "모임이 시작되었습니다.",
      startFail: "시작 실패",

      completeSuccess: "모임이 종료되었습니다.",
      completeFail: "종료 실패",

      gatheringCancelSuccess: "모임이 취소되었습니다.",
      gatheringCancelFail: "취소 실패",

      noShowFail: "노쇼 처리 실패",

      completeCheckSuccess: "참가자 출석 체크가 완료되었습니다.",
      completeCheckFail: "출석 체크 처리 중 오류가 발생했습니다.",
    },
  },
  en: {
    headerTitle: "Gathering Details",
    chatButton: "Chat",
    completedBanner: "This gathering has ended",
    canceledBanner: "This gathering is canceled",
    checkNoShow: "No-\nShow",
    edit: "Edit",
    report: "Report",
    participantCount: "Participants:",
    peopleUnit: "",
    roomCode: "Room Code",
    management: "Management",
    start: "Start",
    cancel: "Cancel",
    finish: "Finish 👏",

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
    reportDetailsPlaceholder: "Please enter detailed reasons for the report.",
    alerts: {
      accessDeniedTitle: "Access Denied",
      accessDeniedMsg: "Only approved participants can enter.",
      startTitle: "Start Gathering 🚀",
      startMsg: "Are you sure you want to start this gathering?",
      cancelTitle: "Cancel Gathering",
      cancelMsg: "Are you sure you want to cancel this gathering?",
      finishTitle: "Finish Gathering 👏",
      finishMsg: "Are you sure you want to finish this gathering?",
      cancelApplyTitle: "Cancel Application",
      cancelApplyMsg: "Are you sure you want to cancel your application?",
      yes: "Yes",
      no: "No",
      userNotFound: "User does not exist.",

      success: "Success",
      error: "Error",
      warning: "Warning",

      editSuccess: "Meetup has been updated!",
      editFail: "Failed to update meetup.",

      emptyTitle: "Please enter a title.",
      emptyDescription: "Please enter a description.",
      emptyLocation: "Please enter a location.",
      invalidMaxPeople: "Please enter a valid max capacity number.",

      applySuccess: "Application submitted successfully.",
      applyFail: "Failed to apply.",

      cancelApplySuccess: "Application has been cancelled.",
      cancelApplyFail: "Failed to cancel application.",

      approveSuccess: "Participant approved successfully.",
      approveFail: "Failed to approve.",

      pendingSuccess: "Status changed to pending.",
      pendingFail: "Failed to change status.",

      banSuccess: "Participant has been banned.",
      banFail: "Failed to ban participant.",

      startSuccess: "Gathering has started.",
      startFail: "Failed to start gathering.",

      completeSuccess: "Gathering has ended.",
      completeFail: "Failed to end gathering.",

      gatheringCancelSuccess: "Gathering has been cancelled.",
      gatheringCancelFail: "Failed to cancel gathering.",

      noShowFail: "Failed to process no-show.",

      completeCheckSuccess: "Attendance check completed successfully.",
      completeCheckFail: "An error occurred during attendance check.",
    },
  },
};

export const useGatheringDetailLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
