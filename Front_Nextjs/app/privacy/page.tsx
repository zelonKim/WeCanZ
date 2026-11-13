"use client";

import { usePrivacyLanguage } from "@/hooks/Languages/usePrivacyLanguage";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const { t } = usePrivacyLanguage();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        {/* 상단 헤더 & 언어전환 & 뒤로가기 */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">🔒</span> {t.headerTitle}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
            >
              {t.backButton}
            </button>
          </div>
        </div>

        {/* 개인정보 처리방침 본문 */}
        <div className="space-y-6 text-[#D1D1D6] leading-relaxed text-sm ">
          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s1.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s1.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s2.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s2.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s3.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s3.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s4.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s4.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s5.title}
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-1">
              <p>{t.sections.s5.desc}</p>
              <div className="pt-2 text-[#A1A1A6] font-semibold">
                <p>
                  {t.sections.s5.serviceName}{" "}
                  <span className="text-white font-semibold">WeCanZ</span>
                </p>
                <p>
                  {t.sections.s5.officer}{" "}
                  <span className="text-white font-semibold">
                    {t.sections.s5.officerName}
                  </span>
                </p>
                <p>
                  {t.sections.s5.email}{" "}
                  <span className="text-white font-semibold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-1.5">
              {t.sections.s6.title}
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-2">
              <p>{t.sections.s6.desc}</p>
              <div className="text-[#E5E5EA] space-y-1">
                <p>
                  {t.sections.s6.methodPrefix} <b>{t.sections.s6.methodBold}</b>{" "}
                  {t.sections.s6.methodSuffix}
                </p>
                <p>
                  {t.sections.s6.immediatePrefix} {t.sections.s6.immediateDesc}
                </p>
                <p>
                  {t.sections.s6.retainPrefix} {t.sections.s6.retainDesc}
                </p>
                <ul className="pl-8 font-medium list-disc space-y-1 text-gray-400">
                  <li>
                    {t.sections.s6.logsInfo} <b>{t.sections.s6.logsPeriod}</b>{" "}
                    {t.sections.s6.logsLaw}
                  </li>
                  <li>
                    {t.sections.s6.disputeInfo}{" "}
                    <b>{t.sections.s6.disputePeriod}</b>{" "}
                    {t.sections.s6.disputeLaw}
                  </li>
                  <li>
                    {t.sections.s6.paymentInfo}{" "}
                    <b>{t.sections.s6.paymentPeriod}</b>{" "}
                    {t.sections.s6.paymentLaw}
                  </li>
                </ul>
              </div>
              <div className="pt-2 font-bold text-[#A1A1A6]">
                <p>
                  {t.sections.s6.emailLabel}{" "}
                  <span className="text-white font-semibold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-bold text-[#bef408] mb-1.5">
              {t.sections.s7.title}
            </h2>
            <div className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA] space-y-1">
              <p>{t.sections.s7.content}</p>
              <div className="pt-2 font-bold text-[#A1A1A6]">
                <p>
                  {t.sections.s7.emailLabel}{" "}
                  <span className="text-white font-semibold">
                    ksz18601@gmail.com
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 영역 */}
        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          {t.effectiveDate}
        </div>
      </div>
    </div>
  );
}
