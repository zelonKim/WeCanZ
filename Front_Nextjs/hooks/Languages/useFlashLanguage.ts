import { useEffect, useState } from "react";

export const useFlashLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"ko" | "en">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language || navigator.languages[0];
      const langCode = browserLang.toLowerCase().startsWith("ko") ? "ko" : "en";
      setCurrentLang(langCode);
    }
  }, []);
  
  const isKorean = currentLang === "ko";

  return {
    isKorean,
    headerTitle: isKorean ? "Joined Meetup" : "Joined Meetup",
    badgeHost: isKorean ? "👑 방장" : "👑 Host",
    badgeApproved: isKorean ? "✅ 참여중" : "✅ Joined",
    badgePending: isKorean ? "⏳ 승인 대기중" : "⏳ Pending",
    emptyMessage: isKorean
      ? "현재 참여 중인 밋업이 없어요.\n새로운 밋업에 참여해보세요!"
      : "You are not participating in any meetups.\nExplore and join a new meetup!",
  };
};
