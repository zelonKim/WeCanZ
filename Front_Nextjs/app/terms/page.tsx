"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        {/* 상단 헤더 & 뒤로가기 */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">📋 </span> 서비스 이용약관
          </h1>
          <button
            onClick={() => router.back()}
            className="text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
          >
            뒤로가기
          </button>
        </div>

        {/* 약관 본문 */}
        <div className="space-y-4 text-[#D1D1D6] leading-relaxed text-sm md:text-[15px]">
          <section>
            <h2 className="text-sm font-bold text-yellow-400 mb-1.5">
              제 1 조 (목적)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이
              술번개, 클럽번개 등 온·오프라인 소모임을 편리하게 개설하고 참여할
              수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로
              합니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-yellow-400 mb-1.5">
              제 2 조 (금지 행위)
            </h2>
            <ul className="list-disc list-inside space-y-1 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <li>
                회원은 서비스 이용 시 타인을 비방하거나 성희롱, 욕설, 영리
                목적의 홍보, 타인 사칭 등의 행위를 해서는 안 됩니다.
              </li>
              <li>
                운영자는 위반 행위가 적발될 경우 사전 통보 없이 이용 정지 혹은
                강제 탈퇴 등의 조치를 취할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold text-yellow-400 mb-1.5">
              제 3 조 (책임의 제한)
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
              <p>
                3. 플랫폼은 회원이 게시하거나 전송한 정보의 진위여부나 정확성에
                대해 보증하지 않으며, 회원 간의 상호작용으로 인해 발생하는
                손해에 대해 면책됩니다.
              </p>
            </div>
          </section>
        </div>

        {/* 푸터 영역 */}
        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          시행 일자: 2026년 9월 4일
        </div>
      </div>
    </div>
  );
}
