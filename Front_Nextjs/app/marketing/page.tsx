import React from "react";

interface Section {
  title: string;
  body: string;
}

const MARKETING_SECTIONS: Section[] = [
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
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 헤더 타이틀 섹션 */}
        <div className="border-b border-zinc-800 pb-6">
          <span className="text-sm font-medium text-emerald-400 tracking-wider uppercase">
            WeCanZ Legal & Policy
          </span>
          <h1 className="text-3xl font-bold tracking-tight mt-2 text-white">
            마케팅 정보 수신 동의
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            시행일자: 2026년 11월 1일
          </p>
        </div>

        {/* 안내 문구 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
            본 약관은 <strong className="text-white">WeCanZ</strong>에서
            제공하는 이벤트, 혜택 및 맞춤형 서비스 안내를 위한 마케팅 정보 수신
            동의에 관한 사항을 규정합니다.
          </p>
        </div>

        {/* 조항 리스트 섹션 */}
        <div className="space-y-6">
          {MARKETING_SECTIONS.map((section, index) => (
            <section
              key={index}
              className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 transition-all hover:border-zinc-700"
            >
              <h2 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  제 {index + 1}조
                </span>
                {section.title.replace(/^제\s*\d+조\s*/, "")}
              </h2>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-6 text-center text-sm text-zinc-500">
          <p>
            마케팅 수신 동의 및 서비스 이용 관련 문의사항은 아래 채널을 이용해
            주시기 바랍니다.
          </p>
          <p className="text-zinc-400 mt-1 font-medium">
            이메일: ksz18601@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}
