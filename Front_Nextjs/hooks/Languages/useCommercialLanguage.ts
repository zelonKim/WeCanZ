import { useEffect, useState } from "react";

export const useCommercialLanguage = () => {
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
    headerTitle: "Z-Spot",
    modalTitle: isKorean
      ? "📢 광고 및 제휴 신청 안내"
      : "📢 Partnership & Ad Inquiry",
    modalDescription: isKorean
      ? "Z-Spot에 제휴 광고를 원하시는 분께서는 아래 채널로 문의해 주세요."
      : "If you wish to advertise on Z-Spot,\n please contact us via below email.",
    modalEmailLabel: isKorean ? "- 이메일:" : "- Email:",
    modalClose: isKorean ? "확인" : "Close",

    adBadge: isKorean ? "광고" : "AD",
    hoursLabel: isKorean ? "⏰ 영업시간:" : "⏰ Hours:",

    loadError: isKorean
      ? "광고를 불러오는 데 실패했습니다."
      : "Failed to load advertisements.",
    emptyText: isKorean
      ? "현재 진행 중인 제휴 광고가 없습니다."
      : "There are no active commercial ads.",
    linkError: isKorean ? "링크를 열 수 없습니다." : "Unable to open the link.",
  };
};
