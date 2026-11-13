import * as Localization from "expo-localization";

const translations = {
  ko: {
    titles: {
      terms: "서비스 이용 약관",
      privacy: "개인정보 처리 방침",
      marketing: "마케팅 정보 수신 동의",
    },
    confirmBtn: "확인",
    sections: {
      terms: [
        {
          title: "제 1조 (목적)",
          body: "본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 온·오프라인 소모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.",
        },
        {
          title: "제 2조 (부적절한 콘텐츠 및 악성 사용자에 대한 무관용 원칙)",
          body: "본 서비스는 불쾌하거나 부적절한 콘텐츠(UGC) 및 이를 유포하는 악성 사용자에 대해 절대 용납하지 않는 무관용 정책(Zero-Tolerance Policy)을 엄격히 적용합니다.\n\n다음 각 호의 행위는 엄격히 금지됩니다:\n- 음란물, 성희롱, 혐오 발언, 비속어, 폭력적 표현 작성\n- 타인 비방, 명예훼손, 사칭, 개인정보 유출 행위\n- 스팸, 영리 목적의 불법 광고 및 사기 행위",
        },
        {
          title: "제 3조 (신고 및 차단, 모니터링 시스템)",
          body: "1. 신고 기능: 회원은 부적절한 게시글, 메시지 또는 사용자를 발견할 경우 앱 내 <신고> 버튼을 통해 즉시 관리자에게 접수할 수 있습니다.\n\n2. 차단 기능: 회원은 원치 않는 사용자를 언제든지 <차단>할 수 있으며, 차단 처리 즉시 해당 사용자의 프로필, 게시물 및 대화 내용이 피드와 채팅방에서 숨겨집니다.\n\n3. '24시간' 내 조치: 운영진은 신고 접수 후 24시간 이내에 해당 콘텐츠를 검토하고, 위반이 확인될 경우 적절한 삭제 조치 및 해당 사용자의 이용을 제한(강제 탈퇴 등)합니다.",
        },
        {
          title: "제 4조 (책임의 제한)",
          body: "1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 충돌 및 각종 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.\n\n2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.",
        },
      ],
      privacy: [
        {
          title: "제 1조 (수집하는 개인정보 항목)",
          body: "본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.",
        },
        {
          title: "제 2조 (개인정보의 보유 및 이용 기간)",
          body: "수집된 개인정보는 회원 탈퇴 시 즉시 파기하는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보존이 필요한 경우 안전하게 분리 보관합니다.",
        },
        {
          title: "제 3조 (개인정보의 파기 절차 및 방법)",
          body: "회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제합니다.",
        },
        {
          title: "제 4조 (개인정보의 제3자 제공)",
          body: "본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.",
        },
        {
          title: "제 5조 (개인정보 관리책임자 및 문의처)",
          body: "서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의, 불만 처리, 피해구제 등에 관한 사항은 아래의 문의처로 연락해 주시기 바랍니다.\n- 서비스명: WeCanZ\n- 문의 및 개인정보 보호 담당: WeCanZ 운영팀\n- 문의 이메일: ksz18601@gmail.com",
        },
        {
          title: "제 6조 (계정 삭제 및 데이터 파기 요청)",
          body: "사용자는 언제든지 서비스 내 설정 메뉴 또는 문의 이메일을 통해 계정 삭제(회원 탈퇴)를 요청할 수 있습니다.\n\n- 삭제 요청 방법: 앱 내 ([마이페이지] -> [설정] -> [회원 탈퇴]) 버튼 클릭 혹은 문의 이메일로 요청\n- 즉시 삭제되는 데이터: 계정 프로필 정보, 개인 설정 및 서비스 이용 기록 일체 (탈퇴 즉시 파기)\n- 추가 보관되는 데이터:\n  · 계정 로그인/접속 기록: 3개월 (통신비밀보호법)\n  · 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)\n  · 계약 또는 청약철회, 대금결제 및 재화 공급 기록: 5년 (전자상거래법)\n- 문의 이메일: ksz18601@gmail.com",
        },
        {
          title: "제 7조 (아동 및 청소년 보호 정책)",
          body: "본 서비스는 아동 성적 학대 및 착취(CSAM/CSAE) 콘텐츠를 엄격히 금지합니다. 해당 콘텐츠나 사용자가 발견될 경우 즉시 계정 정지 및 사법 기관 신고가 이루어지며, 서비스 내 신고 기능을 통해 24시간 제보할 수 있습니다.\n제보 이메일: ksz18601@gmail.com",
        },
      ],
      marketing: [
        {
          title: "제 1조 (목적 및 수집 항목)",
          body: "WeCanZ는 신규 모임 추천, 이벤트 및 혜택 안내, 맞춤형 밋업 추천 서비스 제공을 위해 이용자의 이메일 주소, 앱 푸시 알림 수신 상태 및 서비스 이용 기록을 수집·이용합니다.",
        },
        {
          title: "제 2조 (보유 및 이용 기간)",
          body: "마케팅 동의일로부터 회원 탈퇴 시 또는 동의 철회 시까지 보관하며, 동의를 철회할 경우 관련 마케팅 목적의 개인정보는 즉시 파기하거나 마케팅 활용 대상에서 제외합니다.",
        },
        {
          title: "제 3조 (동의 거부 권리 및 불이익)",
          body: "이용자는 마케팅 정보 수신 동의를 거부할 권리가 있으며, 동의를 거부하더라도 WeCanZ의 기본 모임 참여 및 중개 서비스 이용에는 어떠한 제한도 받지 않습니다.",
        },
        {
          title: "제 4조 (수신 동의 철회 방법)",
          body: "고객센터 이메일(ksz18601@gmail.com)을 통해 언제든지 마케팅 수신 동의를 철회하거나 앱 푸시 알림을 거부할 수 있습니다.",
        },
      ],
    },
  },
  en: {
    titles: {
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      marketing: "Marketing Information Consent",
    },
    confirmBtn: "Confirm",
    sections: {
      terms: [
        {
          title: "Article 1 (Purpose)",
          body: "This platform is intended for adults aged 19 and over, aiming to provide community and meetup brokerage services so that users can conveniently create and participate in online and offline gatherings.",
        },
        {
          title:
            "Article 2 (Zero-Tolerance Policy for Objectionable Content & Bad Actors)",
          body: "This service strictly enforces a Zero-Tolerance Policy against objectionable content (UGC) and malicious users who distribute it.\n\nThe following activities are strictly prohibited:\n- Creating pornography, sexual harassment, hate speech, profanity, or violent expressions\n- Defamation, slander, impersonation, or leaking personal information\n- Spam, illegal commercial advertising, and fraudulent activities",
        },
        {
          title: "Article 3 (Reporting, Blocking & Monitoring System)",
          body: "1. Reporting Feature: If members encounter inappropriate posts, messages, or users, they can immediately report them to administrators via the in-app <Report> button.\n\n2. Blocking Feature: Members can <Block> unwanted users at any time, and upon blocking, the user's profile, posts, and chat history are instantly hidden from feeds and chat rooms.\n\n3. Action Within 24 Hours: The operations team reviews the content within 24 hours of receiving a report, and if a violation is confirmed, takes appropriate removal measures and restricts the user's access (such as forced withdrawal).",
        },
        {
          title: "Article 4 (Limitation of Liability)",
          body: "1. As a brokerage platform for free gathering creation and participation among members, this platform assumes no legal responsibility for conversations, offline meetings, physical contact, and various disputes occurring between members during gatherings.\n\n2. All responsibilities, such as safety accidents, financial losses, and criminal incidents occurring during participation in gatherings, rest with the individuals involved, and the platform operators shall not be held liable unless there is willful misconduct or gross negligence.",
        },
      ],
      privacy: [
        {
          title: "Article 1 (Personal Information Collected)",
          body: "This service collects minimal personal information (nickname, email, profile image, etc.) to provide smooth membership registration and meetup brokerage services.",
        },
        {
          title: "Article 2 (Retention and Use Period)",
          body: "As a rule, collected personal information is immediately destroyed upon account deletion. If retention is required for a certain period according to relevant laws, it is safely stored separately.",
        },
        {
          title: "Article 3 (Procedure and Method of Destruction)",
          body: "Personal information whose reason for destruction (such as account deletion) has occurred is safely deleted using technical methods that render it unrecoverable.",
        },
        {
          title: "Article 4 (Provision to Third Parties)",
          body: "This platform does not provide personal information to external parties without the user's consent, and only the minimum profile information necessary for conducting a meetup is shared mutually.",
        },
        {
          title: "Article 5 (Privacy Officer & Contact)",
          body: "For any inquiries, complaints, or damage relief related to privacy protection arising from the use of the service, please contact the information below.\n- Service Name: WeCanZ\n- Privacy Protection Officer: WeCanZ Operations Team\n- Contact Email: ksz18601@gmail.com",
        },
        {
          title: "Article 6 (Account Deletion & Data Destruction Request)",
          body: "Users may request account deletion at any time via the in-app settings menu or by contacting us via email.\n\n- How to Request Deletion: Click ([My Page] -> [Settings] -> [Delete Account]) in the app or request via email\n- Immediately Deleted Data: Account profile, personal settings, and all service usage history (destroyed instantly upon deletion)\n- Additionally Retained Data:\n  · Account login/access records: 3 Months (Protection of Communications Secrets Act)\n  · Records on consumer complaints or dispute resolution: 3 Years (E-Commerce Act)\n  · Records on contracts, payments, and supply of goods: 5 Years (E-Commerce Act)\n- Contact Email: ksz18601@gmail.com",
        },
        {
          title: "Article 7 (Child and Youth Protection Policy)",
          body: "This service strictly prohibits Child Sexual Abuse Material (CSAM/CSAE). If such content or users are found, the account will be immediately suspended and reported to relevant authorities. Reports can be made 24/7 via the in-app reporting feature.\nReport Email: ksz18601@gmail.com",
        },
      ],
      marketing: [
        {
          title: "Article 1 (Purpose & Items Collected)",
          body: "WeCanZ collects and uses the user's email address, app push notification status, and service usage history to provide new meetup recommendations, event/benefit announcements, and personalized meetup suggestions.",
        },
        {
          title: "Article 2 (Retention & Use Period)",
          body: "The information is retained from the date of marketing consent until membership withdrawal or withdrawal of consent. Upon withdrawal of consent, personal information used for marketing purposes is immediately destroyed or excluded from marketing activities.",
        },
        {
          title: "Article 3 (Right to Refuse Consent & Disadvantages)",
          body: "Users have the right to refuse consent to receive marketing information, and refusing consent will not restrict the use of WeCanZ's basic meetup participation and brokerage services in any way.",
        },
        {
          title: "Article 4 (How to Withdraw Consent)",
          body: "Users can withdraw their marketing consent or opt out of app push notifications at any time via our customer support email (ksz18601@gmail.com).",
        },
      ],
    },
  },
};

export const useTermsModalLanguage = () => {
  const deviceLanguage = Localization.getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return {
    currentLang,
    t,
  };
};
