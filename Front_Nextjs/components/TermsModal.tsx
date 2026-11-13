"use client";

import { useTermsModalLanguage } from "@/hooks/Languages/useTermsModalLanguage";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";
import React from "react";

interface TermsModalProps {
  visible: boolean;
  type: AgreementModalTypes | null;
  onClose: () => void;
}

export default function TermsModal({
  visible,
  type,
  onClose,
}: TermsModalProps) {
  const { t, currentLang } = useTermsModalLanguage();

  if (!visible || !type) return null;

  const title = t.titles[type];
  const content = t.contents[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[75vh] bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] p-6 flex flex-col shadow-2xl">
        {/* 상단 타이틀 및 언어 전환 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto my-1 pr-1 custom-scrollbar">
          <p className="text-sm text-[#B0B0B0] leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>

        {/* 확인 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer mt-4 w-full bg-[#bef408] py-3 rounded-xl text-gray-900 font-bold text-sm hover:opacity-90 transition"
        >
          {t.confirmBtn}
        </button>
      </div>
    </div>
  );
}
