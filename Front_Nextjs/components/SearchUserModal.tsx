"use client";

import { SearchUserModalProps } from "@/types/user/SearchUserModalProps";
import { Search, X } from "lucide-react";
import React from "react";

export const SearchUserModal: React.FC<SearchUserModalProps> = ({
  visible,
  onClose,
  searchNickname,
  onChangeSearchNickname,
  onSearch,
  t,
}) => {
  if (!visible) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/70 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 z-10 shadow-2xl">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-lg font-bold text-white">{t.searchModalTitle}</h2>
          <p className="text-xs text-[#8E8E93]">{t.searchModalSubtitle}</p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchNickname}
            onChange={(e) => onChangeSearchNickname(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.searchInputPlaceholder}
            autoFocus
            className="w-full bg-[#2C2C2E] rounded-xl px-4 py-3 text-white text-[15px] placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-[#bef408]"
          />
        </div>

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-semibold text-sm transition cursor-pointer flex items-center justify-center"
          >
            {t.cancelButton}
          </button>

          <button
            type="button"
            onClick={onSearch}
            className="flex-1 h-11 rounded-xl bg-[#bef408] hover:opacity-90 text-black font-bold text-sm transition cursor-pointer flex items-center justify-center"
          >
            {t.searchButton}
          </button>
        </div>
      </div>
    </div>
  );
};
