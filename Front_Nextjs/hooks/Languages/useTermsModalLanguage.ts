import { useEffect, useState } from "react";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";

const translations = {
  ko: {
    titles: {
      terms: "📋 서비스 이용 약관",
      privacy: "🔒 개인정보 처리 방침",
      marketing: "📢 마케팅 정보 수신",
    },
    confirmBtn: "확인",
    contents: {
      terms: `제 1조 (목적)
본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 온·오프라인 모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.

제 2조 (금지 행위)
1. 회원은 서비스 이용 시 타인을 비방하거나 성희롱, 욕설, 영리 목적의 홍보, 타인 사칭 등의 행위를 해서는 안 됩니다.
2. 운영자는 위반 행위가 적발될 경우 사전 통보 없이 이용 정지 혹은 강제 탈퇴 등의 조치를 취할 수 있습니다.

제 3조 (책임의 제한)
1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 접촉 및 각종 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.
2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.
3. 플랫폼은 회원이 게시하거나 전송한 정보의 진위여부나 정확성에 대해 보증하지 않으며, 회원 간의 상호작용으로 인해 발생하는 손해에 대해 면책됩니다.`,

      privacy: `제 1조 (수집하는 개인정보 항목)
본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.

제 2조 (개인정보의 보유 및 이용 기간)
수집된 개인정보는 회원 탈퇴 시 즉시 파기되는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보관이 필요한 경우 안전하게 분리 보관됩니다.

제 3조 (개인정보의 파기 절차 및 방법)
회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제됩니다.

제 4조 (개인정보의 제3자 제공)
본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.`,

      marketing: `제 1조 (목적 및 수집 항목)
WeCanZ는 신규 모임 추천, 이벤트 및 혜택 안내, 맞춤형 밋업 추천 서비스 제공을 위해 이용자의 이메일 주소, 앱 푸시 알림 수신 상태 및 서비스 이용 기록을 수집·이용합니다.

제 2조 (보유 및 이용 기간)
마케팅 동의일로부터 회원 탈퇴 시 또는 동의 철회 시까지 보관하며, 동의를 철회할 경우 관련 마케팅 목적의 개인정보는 즉시 파기하거나 마케팅 활용 대상에서 제외합니다.

제 3조 (동의 거부 권리 및 불이익)
이용자는 마케팅 정보 수신 동의를 거부할 권리가 있으며, 동의를 거부하더라도 WeCanZ의 기본 모임 참여 및 중개 서비스 이용에는 어떠한 제한도 받지 않습니다.

제 4조 (수신 동의 철회 방법)
이용자는 앱 내 설정 화면에서 언제든지 마케팅 수신 동의를 철회하거나 알림을 거부할 수 있으며, 고객센터 이메일을 통해서도 철회가 가능합니다.

📧 고객센터 이메일: ksz18601@gmail.com`,
    },
  },
  en: {
    titles: {
      terms: "📋 Terms of Service",
      privacy: "🔒 Privacy Policy",
      marketing: "📢 Marketing Information Consent",
    },
    confirmBtn: "Confirm",
    contents: {
      terms: `Article 1 (Purpose)
This platform is intended for adults aged 19 and over, and aims to provide community and meetup brokerage services so that users can conveniently create and participate in online and offline gatherings.

Article 2 (Prohibited Activities)
1. Users must not defame, sexually harass, curse, commercially promote, or impersonate others while using the service.
2. The operator may take measures such as suspension or forced withdrawal without prior notice if violations are discovered.

Article 3 (Limitation of Liability)
1. As a brokerage platform for free gathering creation and participation among members, this platform assumes no legal responsibility for conversations, offline meetings, physical contact, and various disputes occurring between members.
2. All responsibilities, such as safety accidents, financial losses, and criminal incidents occurring during gatherings, rest with the individuals involved, and the operators shall not be held liable unless there is willful misconduct or gross negligence.
3. The platform does not guarantee the authenticity or accuracy of information posted or transmitted by members, and is exempt from liability for damages arising from interactions between members.`,

      privacy: `Article 1 (Personal Information Collected)
This service collects minimal personal information (nickname, email, profile image, etc.) to provide smooth membership registration and meetup brokerage services.

Article 2 (Retention and Use Period)
As a rule, collected personal information is immediately destroyed upon account deletion. If retention is required for a certain period according to relevant laws, it is safely stored separately.

Article 3 (Procedure and Method of Destruction)
Personal information whose reason for destruction has occurred is safely deleted using technical methods that render it unrecoverable.

Article 4 (Provision to Third Parties)
This platform does not provide personal information to external parties without the user's consent, and only the minimum profile information necessary for conducting a meetup is shared mutually.`,

      marketing: `Article 1 (Purpose & Items Collected)
WeCanZ collects and uses the user's email address, app push notification status, and service usage history to provide new meetup recommendations, event/benefit announcements, and personalized meetup suggestions.

Article 2 (Retention & Use Period)
The information is retained from the date of marketing consent until membership withdrawal or withdrawal of consent. Upon withdrawal of consent, personal information used for marketing purposes is immediately destroyed or excluded from marketing activities.

Article 3 (Right to Refuse Consent & Disadvantages)
Users have the right to refuse consent to receive marketing information, and refusing consent will not restrict the use of WeCanZ's basic meetup participation and brokerage services in any way.

Article 4 (How to Withdraw Consent)
Users can withdraw their marketing consent or opt out of notifications at any time in the in-app settings screen, or request withdrawal via our customer support email.

📧 Support Email: ksz18601@gmail.com`,
    },
  },
};

export const useTermsModalLanguage = () => {
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
