import { getLocales } from "expo-localization";

const translations = {
  ko: {
    alerts: {
      success: "성공",
      error: "오류",
      warning: "경고",
      notice: "알림",

      friendRequestSuccess: "친구 요청을 보냈습니다.",
      friendRequestFail: "친구 신청에 실패했습니다.",

      blockSuccess: "해당 유저를 차단했습니다.",
      blockFail: "유저 차단에 실패했습니다.",

      reportSuccessTitle: "신고 완료",
      reportSuccess: "신고가 성공적으로 접수되었습니다.",
      reportFail: "신고 접수 중 오류가 발생했습니다.",
      reportEmptyDetails: "상세 신고 내용을 입력해주세요.",
      reportUserNotFoundTitle: "조회 실패",
      reportUserNotFound: "존재하지 않는 유저이거나 조회 실패했습니다.",

      sendMessageFail: "메시지를 전송하지 못했습니다.",
      deleteMessageTitle: "메시지 삭제",
      deleteMessageConfirm: "이 메시지를 삭제하시겠습니까?",
      cancel: "취소",
      delete: "삭제",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      warning: "Warning",
      notice: "Notice",

      friendRequestSuccess: "Friend request sent.",
      friendRequestFail: "Failed to send friend request.",

      blockSuccess: "User has been blocked.",
      blockFail: "Failed to block user.",

      reportSuccessTitle: "Report Submitted",
      reportSuccess: "Your report has been submitted successfully.",
      reportFail: "An error occurred while submitting the report.",
      reportEmptyDetails: "Please enter report details.",
      reportUserNotFoundTitle: "Lookup Failed",
      reportUserNotFound: "User does not exist or lookup failed.",

      sendMessageFail: "Failed to send message.",
      deleteMessageTitle: "Delete Message",
      deleteMessageConfirm: "Are you sure you want to delete this message?",
      cancel: "Cancel",
      delete: "Delete",
    },
  },
};

export const useDmRoomLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
