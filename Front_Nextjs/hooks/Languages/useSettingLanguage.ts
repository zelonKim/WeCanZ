import { ReportReason } from "@/types/user/ReportReason";
import { useEffect, useState } from "react";

const translations = {
  ko: {
    headerTitle: "Settings",
    editButton: "편집",
    emptyBio: "아직 작성된 자기소개가 없습니다.",
    yesShow: "예스쇼",
    noShow: "노쇼",

    sectionApp: "앱 설정",
    menuNotification: "메시지 알림",
    menuMarketingAgree: "마케팅 정보 수신 동의",
    menuTerms: "서비스 이용약관",
    menuPrivacy: "개인정보 처리방침",
    menuReport: "신고하기",

    sectionAccount: "계정 관리",
    menuLogout: "로그아웃",
    menuDeleteAccount: "회원 탈퇴",
    editModalTitle: "프로필 수정",
    imageHint: "이미지를 터치하여 갤러리에서 선택하세요",
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "닉네임을 입력하세요",
    bioLabel: "자기소개",
    bioPlaceholder: "자기소개를 입력하세요",
    saveButton: "저장하기",

    reportModalTitle: "🚨 유저 신고하기",
    reportTargetLabel: "신고할 유저 닉네임",
    reportTargetPlaceholder: "상대방 닉네임을 입력해주세요",
    reportReasonLabel: "신고 사유 선택",
    reportDetailsLabel: "상세 내용",
    reportDetailsPlaceholder: "신고 사유에 대한 상세 내용을 적어주세요.",
    reportSubmitButton: "신고 접수하기",
    menuMarketing: "마케팅 정보 수신",
    searchModalTitle: "🔍 유저 프로필 찾기",
    searchModalSubtitle: "찾고 싶은 유저의 닉네임을 입력하세요.",
    searchInputPlaceholder: "닉네임 입력",
    cancelButton: "취소",
    searchButton: "검색",

    alerts: {
      success: "완료",
      error: "오류",
      warning: "경고",
      notice: "알림",
      alertImageGranted: "사진을 선택하려면 갤러리 접근 권한이 필요합니다.",
      nicknameAlert: "닉네임은 2자 이상 30자 이하로 입력해주세요.",
      uploadImageError: "프로필 이미지 업로드 중 문제가 발생했습니다.",
      deleteAccount: "회원 탈퇴가 완료되었습니다.",
      enterNicknameAlert: "유저 닉네임을 입력해주세요.",
      userNotFound: "존재하지 않는 유저입니다.",
      profileUpdated: "프로필이 성공적으로 수정되었습니다.",
      reportSuccess: "신고가 성공적으로 접수되었습니다.",
      logoutTitle: "로그아웃",
      logoutConfirm: "정말 로그아웃 하시겠습니까?",
      logoutAction: "로그아웃",
      deleteAccountTitle: "회원 탈퇴",
      deleteAccountConfirm:
        "정말로 탈퇴하시겠습니까?\n계정 정보와 모든 데이터가 삭제되며 복구할 수 없습니다.",
      deleteAccountAction: "탈퇴하기",
      permTitle: "알림 권한 필요",
      permDesc: "알림을 받으시려면 기기 설정에서 알림 권한을 허용해 주세요.",
      settingsButton: "설정으로 이동",
      cancel: "취소",
      absentNickname: "닉네임을 입력해 주세요.",
      updateProfileError: "프로필 업데이트 중 오류가 발생했습니다.",
      deleteAccountError: "회원 탈퇴 중 오류가 발생했습니다.",
      createReportError: "신고 접수 중 오류가 발생했습니다.",
      marketingAgreeError: "마케팅 수신 동의 상태 변경에 실패했습니다.",
    },

    reportReasonLabels: {
      [ReportReason.SPAM]: "불법 광고 및 도배",
      [ReportReason.INAPPROPRIATE]: "부적절한 콘텐츠",
      [ReportReason.ABUSE]: "욕설 및 혐오 발언",
      [ReportReason.IMPERSONATION]: "사칭 및 허위 정보",
      [ReportReason.OTHER]: "기타",
    },
  },
  en: {
    headerTitle: "Settings",
    editButton: "Edit",
    emptyBio: "No bio written yet.",
    yesShow: "Yes-Show",
    noShow: "No-Show",

    sectionApp: "App Settings",
    menuNotification: "Message Notifications",
    menuMarketingAgree: "Marketing Agreement",
    menuTerms: "Terms of Service",
    menuPrivacy: "Privacy Policy",
    menuReport: "Report User",

    sectionAccount: "Account Management",
    menuLogout: "Log Out",
    menuDeleteAccount: "Delete Account",
    editModalTitle: "Edit Profile",
    imageHint: "Tap the image to select from gallery",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "Enter nickname",
    bioLabel: "Bio",
    bioPlaceholder: "Enter bio",
    saveButton: "Save Changes",

    reportModalTitle: "🚨 Report User",
    reportTargetLabel: "Target User Nickname",
    reportTargetPlaceholder: "Enter user nickname",
    reportReasonLabel: "Select Reason",
    reportDetailsLabel: "Details",
    reportDetailsPlaceholder: "Please enter detailed reasons for the report.",
    reportSubmitButton: "Submit Report",
    menuMarketing: "Marketing Information",
    searchModalTitle: "🔍 Search User Profile",
    searchModalSubtitle: "Enter the nickname of the user you are looking for.",
    searchInputPlaceholder: "Enter nickname",
    cancelButton: "Cancel",
    searchButton: "Search",

    alerts: {
      success: "Success",
      error: "Error",
      warning: "Warning",
      notice: "Notice",
      alertImageGranted:
        "Photo library permission is required to select a photo.",
      nicknameAlert: "Nickname must be between 2 and 30 characters.",
      uploadImageError: "Failed to upload profile image.",
      deleteAccount: "Your account has been deleted.",
      enterNicknameAlert: "Please enter a user nickname.",
      userNotFound: "User does not exist.",
      profileUpdated: "Profile successfully updated.",
      reportSuccess: "Report submitted successfully.",
      logoutTitle: "Log Out",
      logoutConfirm: "Are you sure you want to log out?",
      logoutAction: "Log Out",
      deleteAccountTitle: "Delete Account",
      deleteAccountConfirm:
        "Are you sure you want to delete your account?\nAll account info and data will be permanently deleted.",
      deleteAccountAction: "Delete",
      permTitle: "Notification Permission Required",
      permDesc:
        "Please allow notification permissions in your device settings to receive alerts.",
      settingsButton: "Go to Settings",
      cancel: "Cancel",
      absentNickname: "Please enter a nickname.",
      updateProfileError: "Failed to update profile.",
      deleteAccountError: "Failed to delete your account.",
      createReportError: "Failed to submit report.",
      marketingAgreeError: "Failed to update marketing consent.",
    },

    reportReasonLabels: {
      [ReportReason.SPAM]: "Spam & Ads",
      [ReportReason.INAPPROPRIATE]: "Inappropriate Content",
      [ReportReason.ABUSE]: "Abuse & Hate Speech",
      [ReportReason.IMPERSONATION]: "Impersonation",
      [ReportReason.OTHER]: "Other",
    },
  },
};

export const useSettingLanguage = () => {
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
