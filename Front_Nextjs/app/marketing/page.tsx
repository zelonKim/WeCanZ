"use client";

import { useMarketingLanguage } from "@/hooks/Languages/useMarketingLanguage";
import { useRouter } from "next/navigation";

export default function MarketingPage() {
  const router = useRouter();
  const { t, currentLang } = useMarketingLanguage();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      {/* 상단 헤더 & 언어 전환 & 뒤로가기 */}
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        <div className="flex items-center justify-between mb-5 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-3">
            <span className="text-red-500">📢</span> {t.headerTitle}
          </h1>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
            >
              {t.backButton}
            </button>
          </div>
        </div>

        {/* 마케팅 수신 동의 본문 내용 */}
        <div className="space-y-6 text-[#D1D1D6] leading-relaxed text-sm ">
          <section>
            <h2 className="text-sm font-bold text-[#BEF40B] mb-1.5">
              {t.sections.s1.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s1.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#BEF40B] mb-1.5">
              {t.sections.s2.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s2.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#BEF40B] mb-1.5">
              {t.sections.s3.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s3.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#BEF40B] mb-1.5">
              {t.sections.s4.title}
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-2">
              <p>{t.sections.s4.desc}</p>
              <div className="pt-2 font-bold text-[#A1A1A6] space-y-1">
                <p>
                  {t.sections.s4.emailLabel}{" "}
                  <span className="text-white font-semibold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 푸터 영역 */}
        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          {t.effectiveDate}
        </div>
      </div>
    </div>
  );
}
