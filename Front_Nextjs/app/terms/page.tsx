"use client";

import { useTermsLanguage } from "@/hooks/Languages/useTermsLanguage";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  const { t } = useTermsLanguage();

  return (
    <div className="min-h-screen bg-[#000000] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto bg-[#1C1C1E] rounded-xl p-5 md:p-6 shadow-xl border border-[#2C2C2E]">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2E]">
          <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-500">📋 </span> {t.headerTitle}
          </h1>
          <button
            onClick={() => router.back()}
            className="cursor-pointer text-xs font-semibold text-[#8E8E93] hover:text-white transition px-2.5 py-1 rounded-md bg-[#2C2C2E]"
          >
            {t.backButton}
          </button>
        </div>

        <div className="space-y-6 text-[#D1D1D6] leading-relaxed text-sm">
          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-2">
              {t.sections.s1.title}
            </h2>
            <p className="bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              {t.sections.s1.content}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-2">
              {t.sections.s2.title}
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p className="font-semibold text-red-400">
                {t.sections.s2.zeroTolerance}
              </p>
              <p>{t.sections.s2.prohibitedIntro}</p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                {t.sections.s2.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-2">
              {t.sections.s3.title}
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p>
                1. <strong>{t.sections.s3.item1Title}</strong>{" "}
                {t.sections.s3.item1Desc}
              </p>
              <p>
                2. <strong>{t.sections.s3.item2Title}</strong>{" "}
                {t.sections.s3.item2Desc}
              </p>
              <p>
                3. <strong>{t.sections.s3.item3Title}</strong>{" "}
                {t.sections.s3.item3Desc}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#bef408] mb-2">
              {t.sections.s4.title}
            </h2>
            <div className="space-y-2 bg-[#2C2C2E]/50 p-3 rounded-lg text-[#E5E5EA]">
              <p>1. {t.sections.s4.item1}</p>
              <p>2. {t.sections.s4.item2}</p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-[#2C2C2E] text-center text-[13px] text-[#8E8E93]">
          {t.effectiveDate}
        </div>
      </div>
    </div>
  );
}
