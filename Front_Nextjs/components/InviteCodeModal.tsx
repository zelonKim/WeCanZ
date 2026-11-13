"use client";

import React from "react";

interface InviteCodeModalProps {
  visible: boolean;
  inviteCode: string;
  onChangeCode: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  t: any;
}

export const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  visible,
  inviteCode,
  onChangeCode,
  onClose,
  onSubmit,
  isLoading,
  t,
}) => {
  if (!visible) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/85 flex items-center justify-center px-6">
      {/* 배경 클릭 시 모달 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 컨테이너 */}
      <form
        onSubmit={handleFormSubmit}
        className="relative z-10 w-full max-w-[320px] bg-[#18181B] rounded-[24px] p-6 flex flex-col items-center border border-white/10 shadow-2xl"
      >
        <h2 className="text-[18px] font-extrabold text-white mb-2">
          {t.roomCodeTitle}
        </h2>
        <p className="text-[13px] text-[#A1A1AA] mb-5 text-center">
          {t.roomCodeSub}
        </p>

        <input
          type="text"
          value={inviteCode}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder="____"
          maxLength={4}
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus
          className="w-full h-[52px] bg-[#27272A] rounded-xl text-[#bef408] text-xl font-semibold text-center tracking-[8px] placeholder-[#52525B] mb-5 focus:outline-none focus:ring-1 focus:ring-[#bef408]"
        />

        <div className="flex gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] font-bold transition cursor-pointer"
          >
            {t.cancel}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-[#bef408] hover:opacity-90 text-black font-extrabold transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? t.checking : t.enter}
          </button>
        </div>
      </form>
    </div>
  );
};
