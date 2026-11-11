import { getLocales } from "expo-localization";

const translations = {
  ko: {
    headerTitle: "Z-Friend",
    pendingHeader: (count: number) => `받은 친구 요청 (${count})`,
    emptyPending: "받은 친구 요청이 없습니다.",
    accept: "수락",
    reject: "거절",
    friendsHeader: (count: number) => `친구 목록 (${count})`,
    emptyFriends: "아직 등록된 친구가 없습니다.",
    addModalTitle: "👋 친구 추가",
    addModalSubtitle: "추가할 친구의 닉네임을 입력해주세요.",
    nicknamePlaceholder: "닉네임 입력",
    cancel: "취소",
    sendRequest: "요청 보내기",
    blockModalTitle: "🚫 차단 관리",
    blockBtnText: "차단 하기",
    blockedListTitle: (count: number) => `차단된 친구 목록 (${count})`,
    unblockBtn: "차단 해제",
    emptyBlocked: "차단한 유저가 없습니다.",
    roomsHeader: (count: number) => `나의 친구 목록 (${count})`,
    alerts: {
      success: "성공",
      notice: "알림",
      error: "오류",
      acceptSuccess: "친구 요청을 수락했습니다.",
      acceptFail: "수락에 실패했습니다.",
      rejectSuccess: "친구 요청을 거절했습니다.",
      rejectFail: "거절에 실패했습니다.",
      emptyNickname: "친구의 닉네임을 입력해주세요",
      requestSent: "친구 요청을 보냈습니다.",
      requestFail: "오류로 인해 친구 요청에 실패했습니다.",
      dmFail: "DM 이동에 실패했습니다.",
      unblockSuccess: "차단이 해제되었습니다.",
      unblockFail: "차단 해제 실패",
      blockSuccess: "유저를 차단했습니다.",
      blockFail: "유저 차단에 실패했습니다.",
      emptyBlockNickname: "차단할 유저의 닉네임을 입력해주세요.",
      searchFail: "존재하지 않거나 검색할 수 없는 유저입니다.",
      errorMessage: "에러가 발생했습니다.",
      blockConfirmTitle: "유저 차단",
      blockConfirmMsg: (name: string) => `${name}님을 차단하시겠습니까?`,
      blockAction: "차단",

      unblockConfirmTitle: "차단 해제",
      unblockConfirmMsg: (name: string) =>
        `${name}님을 차단 해제 하시겠습니까?`,
      unblockAction: "해제",
    },
  },
  en: {
    headerTitle: "Z-Friend",
    pendingHeader: (count: number) => `Friend Requests (${count})`,
    emptyPending: "No pending friend requests.",
    accept: "Accept",
    reject: "Reject",
    friendsHeader: (count: number) => `My Friends (${count})`,
    emptyFriends: "No friends added yet.",

    addModalTitle: "👋 Add Friend",
    addModalSubtitle: "Enter the nickname of the friend",
    nicknamePlaceholder: "Enter nickname",
    cancel: "Cancel",
    sendRequest: "Send Request",

    blockModalTitle: "🚫 Block Management",
    blockBtnText: "Block",
    blockedListTitle: (count: number) => `Blocked Users (${count})`,
    unblockBtn: "Unblock",
    emptyBlocked: "No blocked users.",
    roomsHeader: (count: number) => `My Friends (${count})`,
    alerts: {
      success: "Success",
      notice: "Notice",
      error: "Error",
      acceptSuccess: "Accepted the friend request.",
      acceptFail: "Failed to accept.",
      rejectSuccess: "Rejected the friend request.",
      rejectFail: "Failed to reject.",
      emptyNickname: "Please enter your friend's nickname.",
      requestSent: "Friend request sent.",
      requestFail: "Failed to send friend request due to an error.",
      dmFail: "Failed to open DM.",
      unblockSuccess: "Unblocked successfully.",
      unblockFail: "Failed to unblock.",
      blockSuccess: "Blocked the user.",
      blockFail: "Failed to block the user.",
      emptyBlockNickname: "Please enter the nickname of the user to block.",
      searchFail: "User does not exist or cannot be found.",
      errorMessage: "Error occured",
      blockConfirmTitle: "Block User",
      blockConfirmMsg: (name: string) => `Do you want to block ${name}?`,
      blockAction: "Block",

      unblockConfirmTitle: "Unblock User",
      unblockConfirmMsg: (name: string) => `Do you want to unblock ${name}?`,
      unblockAction: "Unblock",
    },
  },
};

export const useFriendLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t };
};
