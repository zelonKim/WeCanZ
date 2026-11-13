import { useEffect, useState } from "react";

const translations = {
  ko: {
    headerTitle: "서비스 이용약관 및 운영정책",
    backButton: "뒤로가기",
    effectiveDate: "시행 일자: 2026년 11월 1일",
    sections: {
      s1: {
        title: "제 1 조 (목적)",
        content:
          "본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 온·오프라인 소모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.",
      },
      s2: {
        title: "제 2 조 (부적절한 콘텐츠 및 악성 사용자에 대한 무관용 원칙)",
        zeroTolerance:
          "본 서비스는 불쾌하거나 부적절한 콘텐츠(UGC) 및 이를 유포하는 악성 사용자에 대해 절대 용납하지 않는 무관용 정책(Zero-Tolerance Policy)을 엄격히 적용합니다.",
        prohibitedIntro: "다음 각 호의 행위는 엄격히 금지됩니다:",
        items: [
          "음란물, 성희롱, 혐오 발언, 비속어, 폭력적 표현 작성",
          "타인 비방, 명예훼손, 사칭, 개인정보 유출 행위",
          "스팸, 영리 목적의 불법 광고 및 사기 행위",
        ],
      },
      s3: {
        title: "제 3 조 (신고 및 차단, 모니터링 시스템)",
        item1Title: "신고 기능:",
        item1Desc:
          "회원은 부적절한 게시글, 메시지 또는 사용자를 발견할 경우 앱 내 신고 버튼을 통해 즉시 관리자에게 접수할 수 있습니다.",
        item2Title: "차단 기능:",
        item2Desc:
          "회원은 원치 않는 사용자를 언제든지 차단할 수 있으며, 차단 처리 즉시 해당 사용자의 프로필, 게시물 및 대화 내용이 피드와 채팅창에서 숨겨집니다.",
        item3Title: "24시간 내 조치:",
        item3Desc:
          "운영진은 신고 접수 후 24시간 이내에 해당 콘텐츠를 검토하고, 위반이 확인될 경우 적절한 삭제 조치 및 해당 사용자의 이용을 제한(강제 탈퇴 등)합니다.",
      },
      s4: {
        title: "제 4 조 (책임의 제한)",
        item1:
          "본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 접촉 및 각종 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.",
        item2:
          "모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.",
      },
    },
  },
  en: {
    headerTitle: "Terms of Service & Operation Policy",
    backButton: "Back",
    effectiveDate: "Effective Date: November 1, 2026",
    sections: {
      s1: {
        title: "Article 1 (Purpose)",
        content:
          "This platform is intended for adults aged 19 and over, and aims to provide community and meetup brokerage services so that users can conveniently create and participate in online and offline small gatherings.",
      },
      s2: {
        title:
          "Article 2 (Zero-Tolerance Policy for Objectionable Content & Bad Actors)",
        zeroTolerance:
          "This service strictly enforces a Zero-Tolerance Policy against objectionable content (UGC) and malicious users who distribute it.",
        prohibitedIntro: "The following activities are strictly prohibited:",
        items: [
          "Creating pornography, sexual harassment, hate speech, profanity, or violent expressions",
          "Defamation, slander, impersonation, or leaking personal information",
          "Spam, illegal commercial advertising, and fraudulent activities",
        ],
      },
      s3: {
        title: "Article 3 (Reporting, Blocking & Monitoring System)",
        item1Title: "Reporting Feature:",
        item1Desc:
          "If members encounter inappropriate posts, messages, or users, they can immediately report them to administrators via the in-app report button.",
        item2Title: "Blocking Feature:",
        item2Desc:
          "Members can block unwanted users at any time, and upon blocking, the user's profile, posts, and chat history are instantly hidden from feeds and chat rooms.",
        item3Title: "24-Hour Action:",
        item3Desc:
          "The operations team reviews the content within 24 hours of receiving a report, and if a violation is confirmed, takes appropriate removal measures and restricts the user's access (such as forced withdrawal).",
      },
      s4: {
        title: "Article 4 (Limitation of Liability)",
        item1:
          "As a brokerage platform for free gathering creation and participation among members, this platform assumes no legal responsibility for conversations, offline meetings, physical contact, and various disputes occurring between members during gatherings.",
        item2:
          "All responsibilities, such as safety accidents, financial losses, and criminal incidents occurring during participation in gatherings, rest with the individuals involved, and the platform operators shall not be held liable unless there is willful misconduct or gross negligence.",
      },
    },
  },
};

export const useTermsLanguage = () => {
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