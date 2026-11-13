import { useEffect, useState } from "react";

const translations = {
  ko: {
    headerTitle: "개인정보 처리방침",
    backButton: "뒤로가기",
    effectiveDate: "시행 일자: 2026년 11월 1일",
    sections: {
      s1: {
        title: "제 1 조 (수집하는 개인정보 항목)",
        content:
          "본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.",
      },
      s2: {
        title: "제 2 조 (개인정보의 보유 및 이용 기간)",
        content:
          "수집된 개인정보는 회원 탈퇴 시 즉시 파기되는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보관이 필요한 경우 안전하게 분리 보관됩니다.",
      },
      s3: {
        title: "제 3 조 (개인정보의 파기 절차 및 방법)",
        content:
          "회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제됩니다.",
      },
      s4: {
        title: "제 4 조 (개인정보의 제3자 제공)",
        content:
          "본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.",
      },
      s5: {
        title: "제 5 조 (개인정보 관리책임자 및 문의처)",
        desc: "서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의, 불만 처리, 피해구제 등에 관한 사항은 아래의 문의처로 연락해 주시기 바랍니다.",
        serviceName: "서비스명:",
        officer: "👤 문의 및 개인정보 보호 담당:",
        officerName: "김성진",
        email: "📧 문의 이메일:",
      },
      s6: {
        title: "제 6 조 (계정 삭제 및 데이터 파기 요청)",
        desc: "사용자는 언제든지 서비스 내 설정 메뉴 또는 문의 이메일을 통해 계정 삭제(회원 탈퇴)를 요청할 수 있습니다.",
        methodPrefix: "- 삭제 요청 방법: 앱 내",
        methodBold: "[마이페이지] > [설정] > [회원 탈퇴]",
        methodSuffix: "버튼 클릭 혹은 문의 이메일로 요청",
        immediatePrefix: "- 즉시 삭제되는 데이터:",
        immediateDesc:
          "계정 프로필 정보, 개인 설정 및 서비스 이용 기록 일체 (탈퇴 즉시 파기)",
        retainPrefix: "- 추가 보관되는 데이터:",
        retainDesc:
          "관계 법령 준수를 위해 일부 데이터는 아래 기간 동안 보관 후 파기됩니다.",
        logsInfo: "계정 로그인/접속 기록:",
        logsPeriod: "3개월",
        logsLaw: "(통신비밀보호법)",
        disputeInfo: "소비자의 불만 또는 분쟁처리에 관한 기록:",
        disputePeriod: "3년",
        disputeLaw: "(전자상거래법)",
        paymentInfo: "계약 또는 청약철회, 대금결제 및 재화 공급 기록:",
        paymentPeriod: "5년",
        paymentLaw: "(전자상거래법)",
        emailLabel: "📧 문의 이메일:",
      },
      s7: {
        title: "제 7 조 (아동 및 청소년 보호 정책)",
        content:
          "본 서비스는 아동 성적 학대 및 착취(CSAM/CSAE) 콘텐츠를 엄격히 금지합니다. 해당 콘텐츠나 사용자가 발견될 경우 즉시 계정 정지 및 관련 기관 신고가 이루어지며, 서비스 내 신고 기능을 통해 24시간 제보할 수 있습니다.",
        emailLabel: "📧 제보 이메일:",
      },
    },
  },
  en: {
    headerTitle: "Privacy Policy",
    backButton: "Back",
    effectiveDate: "Effective Date: November 1, 2026",
    sections: {
      s1: {
        title: "Article 1 (Personal Information Collected)",
        content:
          "This service collects minimal personal information (nickname, email, profile image, etc.) to provide smooth membership registration and meetup brokerage services.",
      },
      s2: {
        title: "Article 2 (Retention and Use Period)",
        content:
          "As a rule, collected personal information is immediately destroyed upon account deletion. If retention is required for a certain period according to relevant laws, it is safely stored separately.",
      },
      s3: {
        title: "Article 3 (Procedure and Method of Destruction)",
        content:
          "Personal information whose reason for destruction (such as account deletion) has occurred is safely deleted using technical methods that render it unrecoverable.",
      },
      s4: {
        title: "Article 4 (Provision to Third Parties)",
        content:
          "This platform does not provide personal information to external parties without the user's consent, and only the minimum profile information necessary for conducting a meetup is shared mutually.",
      },
      s5: {
        title: "Article 5 (Privacy Officer & Contact)",
        desc: "For any inquiries, complaints, or damage relief related to privacy protection arising from the use of the service, please contact the information below.",
        serviceName: "Service Name:",
        officer: "👤 Privacy Protection Officer:",
        officerName: "Seong-jin Kim",
        email: "📧 Contact Email:",
      },
      s6: {
        title: "Article 6 (Account Deletion & Data Destruction Request)",
        desc: "Users may request account deletion at any time via the in-app settings menu or by contacting us via email.",
        methodPrefix: "- How to Request Deletion: Click",
        methodBold: "[My Page] > [Settings] > [Delete Account]",
        methodSuffix: "in the app or request via email",
        immediatePrefix: "- Immediately Deleted Data:",
        immediateDesc:
          "Account profile, personal settings, and all service usage history (destroyed instantly upon deletion)",
        retainPrefix: "- Additionally Retained Data:",
        retainDesc:
          "To comply with relevant laws, some data is retained for the periods below before being destroyed.",
        logsInfo: "Account login/access records:",
        logsPeriod: "3 Months",
        logsLaw: "(Protection of Communications Secrets Act)",
        disputeInfo: "Records on consumer complaints or dispute resolution:",
        disputePeriod: "3 Years",
        disputeLaw: "(Act on the Consumer Protection in Electronic Commerce)",
        paymentInfo: "Records on contracts, payments, and supply of goods:",
        paymentPeriod: "5 Years",
        paymentLaw: "(Act on the Consumer Protection in Electronic Commerce)",
        emailLabel: "📧 Contact Email:",
      },
      s7: {
        title: "Article 7 (Child and Youth Protection Policy)",
        content:
          "This service strictly prohibits Child Sexual Abuse Material (CSAM/CSAE). If such content or users are found, the account will be immediately suspended and reported to relevant authorities. Reports can be made 24/7 via the in-app reporting feature.",
        emailLabel: "📧 Report Email:",
      },
    },
  },
};

export const usePrivacyLanguage = () => {
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
