"use client";

import { useRouter } from "next/navigation";

export default function MarketingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      {/* 상단 헤더 & 뒤로가기 */}
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        <div className="flex items-center justify-between mb-5 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-3">
            <span className="text-red-500">📢</span> 마케팅 정보 수신
          </h1>
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1  mb-3 rounded-md bg-[#2C2C2E]"
          >
            뒤로가기
          </button>
        </div>

        {/* 마케팅 수신 동의 본문 내용 */}
        <div className="space-y-4 text-[#D1D1D6] leading-relaxed text-sm md:text-[15px]">
          <section>
            <h2 className="text-[15px] font-bold text-[#BEF40B] mb-1.5">
              제 1조 (목적 및 수집 항목)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              WeCanZ는 신규 모임 추천, 이벤트 및 혜택 안내, 맞춤형 밋업 추천
              서비스 제공을 위해 이용자의 이메일 주소, 앱 푸시 알림 수신 상태 및
              서비스 이용 기록을 수집·이용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#BEF40B] mb-1.5">
              제 2조 (보유 및 이용 기간)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              마케팅 동의일로부터 회원 탈퇴 시 또는 동의 철회 시까지 보관하며,
              동의를 철회할 경우 관련 마케팅 목적의 개인정보는 즉시 파기하거나
              마케팅 활용 대상에서 제외합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#BEF40B] mb-1.5">
              제 3조 (동의 거부 권리 및 불이익)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              이용자는 마케팅 정보 수신 동의를 거부할 권리가 있으며, 동의를
              거부하더라도 WeCanZ의 기본 모임 참여 및 중개 서비스 이용에는
              어떠한 제한도 받지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#BEF40B] mb-1.5">
              제 4조 (수신 동의 철회 방법)
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-2">
              <p>
                이용자는 앱 내 설정 화면에서 언제든지 마케팅 수신 동의를
                철회하거나 알림을 거부할 수 있으며, 고객센터 이메일을 통해서도
                철회가 가능합니다.
              </p>
              <div className="pt-2 font-bold text-[#A1A1A6] space-y-1">
                <p>
                  📧 고객센터 이메일:{" "}
                  <span className="text-white font-bold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 푸터 영역 */}
        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          시행 일자: 2026년 11월 1일
        </div>
      </div>
    </div>
  );
}
