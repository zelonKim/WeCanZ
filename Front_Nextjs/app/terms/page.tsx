"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">

        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">📋 </span> 서비스 이용약관 및
            운영정책
          </h1>
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
          >
            뒤로가기
          </button>
        </div>


        <div className="space-y-4 text-[#D1D1D6] leading-relaxed text-sm md:text-[15px]">
          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              제 1 조 (목적)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이
              온·오프라인 소모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티
              및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.
            </p>
          </section>


          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              제 2 조 (부적절한 콘텐츠 및 악성 사용자에 대한 무관용 원칙)
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p className="font-semibold text-red-400">
                본 서비스는 불쾌하거나 부적절한 콘텐츠(UGC) 및 이를 유포하는
                악성 사용자에 대해 절대 용납하지 않는 무관용 정책(Zero-Tolerance
                Policy)을 엄격히 적용합니다.
              </p>
              <p>다음 각 호의 행위는 엄격히 금지됩니다:</p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm md:text-[15px]">
                <li>음란물, 성희롱, 혐오 발언, 비속어, 폭력적 표현 작성</li>
                <li>타인 비방, 명예훼손, 사칭, 개인정보 유출 행위</li>
                <li>스팸, 영리 목적의 불법 광고 및 사기 행위</li>
              </ul>
            </div>
          </section>


          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              제 3 조 (신고 및 차단, 모니터링 시스템)
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p>
                1. <strong>신고 기능:</strong> 회원은 부적절한 게시글, 메시지
                또는 사용자를 발견할 경우 앱 내 <b>신고</b> 버튼을 통해 즉시
                관리자에게 접수할 수 있습니다.
              </p>
              <p>
                2. <strong>차단 기능:</strong> 회원은 원치 않는 사용자를
                언제든지 <b>차단</b>할 수 있으며, 차단 처리 즉시 해당 사용자의
                프로필, 게시물 및 대화 내용이 피드와 채팅창에서 숨겨집니다.
              </p>
              <p>
                3. <strong>24시간 내 조치:</strong> 운영진은 신고 접수 후 24시간
                이내에 해당 콘텐츠를 검토하고, 위반이 확인될 경우 적절한 삭제
                조치 및 해당 사용자의 이용을 제한(강제 탈퇴 등)합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              제 4 조 (책임의 제한)
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p>
                1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개
                플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인
                만남, 신체적·물리적 접촉 및 각종 분쟁에 대해 어떠한 법적 책임도
                지지 않습니다.
              </p>
              <p>
                2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고
                등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해
                고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.
              </p>
            </div>
          </section>
        </div>


        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          시행 일자: 2026년 11월 1일
        </div>
      </div>
    </div>
  );
}
