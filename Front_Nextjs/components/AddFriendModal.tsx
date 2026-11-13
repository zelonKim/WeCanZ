"use client";

import { AddFriendModalProps } from "@/types/friend/AddFriendModalProps";
import React from "react";

export const AddFriendModal = ({
  visible,
  onClose,
  friendNickname,
  setFriendNickname,
  onSubmit,
  t,
}: AddFriendModalProps) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-5 bg-black/90  animate-fadeIn">
      {/* 모달 박스 */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-[340px] shadow-2xl flex flex-col">
        {/* 타이틀 & 서브타이틀 */}
        <h3 className="text-lg font-bold text-white mb-2 text-center">
          {t.addModalTitle}
        </h3>
        <p className="text-[13px] font-medium text-zinc-400 mb-5 text-center">
          {t.addModalSubtitle}
        </p>

        {/* 닉네임 입력 폼 */}
        <input
          type="text"
          placeholder={t.nicknamePlaceholder}
          value={friendNickname}
          onChange={(e) => setFriendNickname(e.target.value)}
          autoCapitalize="none"
          className="w-full bg-[#2C2C2E] border border-white/10 h-11 rounded-xl px-3.5 text-white text-[15px] outline-none focus:border-[#bef408] transition mb-5"
        />

        {/* 버튼 그룹 */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-sm hover:bg-zinc-700 transition cursor-pointer"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 py-3 rounded-xl bg-[#bef408] text-black font-bold text-sm hover:opacity-90 transition cursor-pointer"
          >
            {t.sendRequest}
          </button>
        </div>
      </div>
    </div>
  );
};
