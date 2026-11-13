import { useEffect, useState } from "react";

const translations = {
  ko: {
    headerTitle: "마케팅 정보 수신",
    backButton: "뒤로가기",
    effectiveDate: "시행 일자: 2026년 11월 1일",
    sections: {
      s1: {
        title: "제 1조 (목적 및 수집 항목)",
        content:
          "WeCanZ는 신규 모임 추천, 이벤트 및 혜택 안내, 맞춤형 밋업 추천 서비스 제공을 위해 이용자의 이메일 주소, 앱 푸시 알림 수신 상태 및 서비스 이용 기록을 수집·이용합니다.",
      },
      s2: {
        title: "제 2조 (보유 및 이용 기간)",
        content:
          "마케팅 동의일로부터 회원 탈퇴 시 또는 동의 철회 시까지 보관하며, 동의를 철회할 경우 관련 마케팅 목적의 개인정보는 즉시 파기하거나 마케팅 활용 대상에서 제외합니다.",
      },
      s3: {
        title: "제 3조 (동의 거부 권리 및 불이익)",
        content:
          "이용자는 마케팅 정보 수신 동의를 거부할 권리가 있으며, 동의를 거부하더라도 WeCanZ의 기본 모임 참여 및 중개 서비스 이용에는 어떠한 제한도 받지 않습니다.",
      },
      s4: {
        title: "제 4조 (수신 동의 철회 방법)",
        desc: "이용자는 앱 내 설정 화면에서 언제든지 마케팅 수신 동의를 철회하거나 알림을 거부할 수 있으며, 고객센터 이메일을 통해서도 철회가 가능합니다.",
        emailLabel: "📧 고객센터 이메일:",
      },
    },
  },
  en: {
    headerTitle: "Marketing Information Consent",
    backButton: "Back",
    effectiveDate: "Effective Date: November 1, 2026",
    sections: {
      s1: {
        title: "Article 1 (Purpose & Items Collected)",
        content:
          "WeCanZ collects and uses the user's email address, app push notification status, and service usage history to provide new meetup recommendations, event and benefit announcements, and personalized meetup suggestion services.",
      },
      s2: {
        title: "Article 2 (Retention & Use Period)",
        content:
          "The information is retained from the date of marketing consent until membership withdrawal or withdrawal of consent. Upon withdrawal of consent, personal information used for marketing purposes is immediately destroyed or excluded from marketing activities.",
      },
      s3: {
        title: "Article 3 (Right to Refuse Consent & Disadvantages)",
        content:
          "Users have the right to refuse consent to receive marketing information, and refusing consent will not restrict the use of WeCanZ's basic meetup participation and brokerage services in any way.",
      },
      s4: {
        title: "Article 4 (How to Withdraw Consent)",
        desc: "Users can withdraw their marketing consent or opt out of notifications at any time in the in-app settings screen, or request withdrawal via our customer support email.",
        emailLabel: "📧 Support Email:",
      },
    },
  },
};

export const useMarketingLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"ko" | "en">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language || navigator.languages[0];
      const langCode = browserLang.toLowerCase().startsWith("ko") ? "ko" : "en";
      setCurrentLang(langCode);
    }
  }, []);

  const t = translations[currentLang];

  return { t, currentLang };
};
