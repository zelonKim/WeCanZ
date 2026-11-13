"use client";

import React from "react";

interface AdsInfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  contactEmail?: string;
  emailLabel?: string;
  closeText: string;
}

export const AdsInfoModal: React.FC<AdsInfoModalProps> = ({
  visible,
  onClose,
  title,
  description,
  contactEmail = "ksz18601@gmail.com",
  emailLabel,
  closeText,
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* 모달 카드 박스 (내부 클릭 시 닫힘 방지) */}
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-[340px] shadow-2xl flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 타이틀 */}
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>

        {/* 설명 */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 mt-1">
          {description}
        </p>

        {/* 이메일 연락처 영역 */}
        {contactEmail && (
          <div className="w-full mb-6">
            <span className="text-xs font-medium text-white">
              {emailLabel ? `${emailLabel} ` : ""}
              {contactEmail}
            </span>
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition cursor-pointer"
        >
          {closeText}
        </button>
      </div>
    </div>
  );
};
