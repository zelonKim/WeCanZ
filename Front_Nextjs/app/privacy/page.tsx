"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        {/* 상단 헤더 & 뒤로가기 */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">🔒</span> 개인정보 처리방침
          </h1>
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
          >
            뒤로가기
          </button>
        </div>

        {/* 개인정보 처리방침 본문 */}
        <div className="space-y-4 text-[#D1D1D6] leading-relaxed text-sm md:text-[15px]">
          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 1 조 (수집하는 개인정보 항목)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해
              최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 2 조 (개인정보의 보유 및 이용 기간)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              수집된 개인정보는 회원 탈퇴 시 즉시 파기되는 것을 원칙으로 하며,
              관계 법령에 따라 일정 기간 보관이 필요한 경우 안전하게 분리
              보관됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 3 조 (개인정보의 파기 절차 및 방법)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적
              방법을 사용하여 안전하게 삭제됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 4 조 (개인정보의 제3자 제공)
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며,
              모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 5 조 (개인정보 관리책임자 및 문의처)
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-1">
              <p>
                서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의, 불만 처리,
                피해구제 등에 관한 사항은 아래의 문의처로 연락해 주시기
                바랍니다.
              </p>
              <div className="pt-2  text-[#A1A1A6] font-semibold">
                <p>
                  서비스명: <span className="text-white font-bold">WeCanZ</span>
                </p>
                <p>
                  👤 문의 및 개인정보 보호 담당:{" "}
                  <span className="text-white font-bold">WeCanZ 운영팀</span>
                </p>
                <p>
                  📧 문의 이메일:{" "}
                  <span className="text-white font-bold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 6 조 (계정 삭제 및 데이터 파기 요청)
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-2">
              <p>
                사용자는 언제든지 서비스 내 설정 메뉴 또는 문의 이메일을 통해
                계정 삭제(회원 탈퇴)를 요청할 수 있습니다.
              </p>
              <div className=" text-[#E5E5EA] space-y-1">
                <p>
                  - 삭제 요청 방법: 앱 내{" "}
                  <b>
                    [마이페이지] {">"} [설정] {">"} [회원 탈퇴]{" "}
                  </b>
                  버튼 클릭 혹은 문의 이메일로 요청
                </p>
                <p>
                  * 즉시 삭제되는 데이터: 계정 프로필 정보, 개인 설정 및 서비스
                  이용 기록 일체 (탈퇴 즉시 파기)
                </p>
                <p>
                  * 추가 보관되는 데이터: 관계 법령 준수를 위해 일부 데이터는
                  아래 기간 동안 보관 후 파기됩니다.
                </p>
                <ul className="pl-8 font-medium list-disc space-y-1 text-gray-400">
                  <li>
                    계정 로그인/접속 기록: <b>3개월</b> (통신비밀보호법)
                  </li>
                  <li>
                    소비자의 불만 또는 분쟁처리에 관한 기록: <b>3년</b>{" "}
                    (전자상거래법)
                  </li>
                  <li>
                    계약 또는 청약철회, 대금결제 및 재화 공급 기록: <b>5년</b>{" "}
                    (전자상거래법)
                  </li>
                </ul>
              </div>
              <div className="pt-2 font-bold text-[#A1A1A6]">
                <p>
                  📧 문의 이메일:{" "}
                  <span className="text-white font-bold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              제 7 조 (아동 및 청소년 보호 정책)
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-1">
              <p>
                본 서비스는 아동 성적 학대 및 착취(CSAM/CSAE) 콘텐츠를 엄격히
                금지합니다. 해당 콘텐츠나 사용자가 발견될 경우 즉시 계정 정지 및
                관련 기관 신고가 이루어지며, 서비스 내 신고 기능을 통해 24시간
                제보할 수 있습니다.
              </p>
              <div className="pt-2 font-bold text-[#A1A1A6]">
                <p>
                  📧 제보 이메일:{" "}
                  <span className="text-white font-bold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
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
