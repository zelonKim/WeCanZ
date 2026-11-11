import { ReportReason } from "@/types/user/ReportReason";
import { getLocales } from "expo-localization";

export const useSettingLanguage = () => {
  const deviceLanguage = getLocales()[0]?.languageCode ?? "ko";
  const isKorean = deviceLanguage === "ko";

  return {
    isKorean,

    headerTitle: isKorean ? "Settings" : "Settings",
    alertImageGranted: isKorean
      ? "사진을 선택하려면 갤러리 접근 권한이 필요합니다."
      : "Photo library permission is required to select a photo.",
    nicknameAlert: isKorean
      ? "닉네임은 2자 이상 30자 이하로 입력해주세요."
      : "Nickname must be between 2 and 30 characters.",
    uploadImageError: isKorean
      ? "프로필 이미지 업로드 중 문제가 발생했습니다."
      : "Failed to upload profile image.",
    editButton: isKorean ? "편집" : "Edit",
    emptyBio: isKorean
      ? "아직 작성된 자기소개가 없습니다."
      : "No bio written yet.",
    yesShow: isKorean ? "예스쇼" : "Yes-Show",
    noShow: isKorean ? "노쇼" : "No-Show",

    sectionApp: isKorean ? "앱 설정" : "App Settings",
    menuNotification: isKorean ? "메시지 알림" : "Message Notifications",
    menuMarketingAgree: isKorean
      ? "마케팅 정보 수신 동의"
      : "Marketing Agreement",
    menuTerms: isKorean ? "서비스 이용약관" : "Terms of Service",
    menuPrivacy: isKorean ? "개인정보 처리방침" : "Privacy Policy",
    menuReport: isKorean ? "신고하기" : "Report User",

    sectionAccount: isKorean ? "계정 관리" : "Account Management",
    menuLogout: isKorean ? "로그아웃" : "Log Out",
    menuDeleteAccount: isKorean ? "회원 탈퇴" : "Delete Account",
    deleteAccount: isKorean
      ? "회원 탈퇴가 완료되었습니다."
      : "Your account has been deleted.",
    editModalTitle: isKorean ? "프로필 수정" : "Edit Profile",
    imageHint: isKorean
      ? "이미지를 터치하여 갤러리에서 선택하세요"
      : "Tap the image to select from gallery",
    nicknameLabel: isKorean ? "닉네임" : "Nickname",
    nicknamePlaceholder: isKorean ? "닉네임을 입력하세요" : "Enter nickname",
    bioLabel: isKorean ? "자기소개" : "Bio",
    bioPlaceholder: isKorean ? "자기소개를 입력하세요" : "Enter bio",
    saveButton: isKorean ? "저장하기" : "Save Changes",

    reportModalTitle: isKorean ? "🚨 유저 신고하기" : "🚨 Report User",
    reportTargetLabel: isKorean ? "신고할 유저 닉네임" : "Target User Nickname",
    reportTargetPlaceholder: isKorean
      ? "상대방 닉네임을 입력해주세요"
      : "Enter user nickname",
    reportReasonLabel: isKorean ? "신고 사유 선택" : "Select Reason",
    reportDetailsLabel: isKorean ? "상세 내용" : "Details",
    reportDetailsPlaceholder: isKorean
      ? "신고 사유에 대한 상세 내용을 적어주세요."
      : "Please enter detailed reasons for the report.",
    reportSubmitButton: isKorean ? "신고 접수하기" : "Submit Report",
    menuMarketing: isKorean ? "마케팅 정보 수신" : "Marketing Information",
    searchModalTitle: isKorean
      ? "🔍 유저 프로필 찾기"
      : "🔍 Search User Profile",
    searchModalSubtitle: isKorean
      ? "찾고 싶은 유저의 닉네임을 입력하세요."
      : "Enter the nickname of the user you are looking for.",
    searchInputPlaceholder: isKorean ? "닉네임 입력" : "Enter nickname",
    cancelButton: isKorean ? "취소" : "Cancel",
    searchButton: isKorean ? "검색" : "Search",

    alertNotice: isKorean ? "알림" : "Notice",
    alertError: isKorean ? "오류" : "Error",
    alertWarning: isKorean ? "경고" : "Warning",
    alertSuccess: isKorean ? "완료" : "Success",

    enterNicknameAlert: isKorean
      ? "유저 닉네임을 입력해주세요."
      : "Please enter a user nickname.",
    userNotFound: isKorean
      ? "존재하지 않는 유저입니다."
      : "User does not exist.",
    profileUpdated: isKorean
      ? "프로필이 성공적으로 수정되었습니다."
      : "Profile successfully updated.",
    reportSuccess: isKorean
      ? "신고가 성공적으로 접수되었습니다."
      : "Report submitted successfully.",
    logoutTitle: isKorean ? "로그아웃" : "Log Out",
    logoutConfirm: isKorean
      ? "정말 로그아웃 하시겠습니까?"
      : "Are you sure you want to log out?",
    logoutAction: isKorean ? "로그아웃" : "Log Out",
    deleteAccountTitle: isKorean ? "회원 탈퇴" : "Delete Account",
    deleteAccountConfirm: isKorean
      ? "정말로 탈퇴하시겠습니까?\n계정 정보와 모든 데이터가 삭제되며 복구할 수 없습니다."
      : "Are you sure you want to delete your account?\nAll account info and data will be permanently deleted.",
    deleteAccountAction: isKorean ? "탈퇴하기" : "Delete",
    permTitle: isKorean ? "알림 권한 필요" : "Notification Permission Required",
    permDesc: isKorean
      ? "알림을 받으시려면 기기 설정에서 알림 권한을 허용해 주세요."
      : "Please allow notification permissions in your device settings to receive alerts.",
    settingsButton: isKorean ? "설정으로 이동" : "Go to Settings",
    cancel: isKorean ? "취소" : "Cancel",
    absentNickname: isKorean
      ? "닉네임을 입력해 주세요."
      : "Please enter a nickname.",
    updateProfileError: isKorean
      ? "프로필 업데이트 중 오류가 발생했습니다."
      : "Failed to update profile.",
    deleteAccountError: isKorean
      ? "회원 탈퇴 중 오류가 발생했습니다."
      : "Failed to delete your account.",
    createReportError: isKorean
      ? "신고 접수 중 오류가 발생했습니다."
      : "Failed to submit report.",
    marketingAgreeError: isKorean
      ? "마케팅 수신 동의 상태 변경에 실패했습니다."
      : "Failed to update marketing consent.",
    reportReasonLabels: {
      [ReportReason.SPAM]: isKorean ? "불법 광고 및 도배" : "Spam & Ads",
      [ReportReason.INAPPROPRIATE]: isKorean
        ? "부적절한 콘텐츠"
        : "Inappropriate Content",
      [ReportReason.ABUSE]: isKorean
        ? "욕설 및 혐오 발언"
        : "Abuse & Hate Speech",
      [ReportReason.IMPERSONATION]: isKorean
        ? "사칭 및 허위 정보"
        : "Impersonation",
      [ReportReason.OTHER]: isKorean ? "기타" : "Other",
    } as Record<ReportReason, string>,
  };
};
