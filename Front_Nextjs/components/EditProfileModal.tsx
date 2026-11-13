"use client";

import { EditProfileModalProps } from "@/types/user/EditProfileModalProps";
import { Camera, Loader2, User, X } from "lucide-react";
import React from "react";

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profileImage,
  onImagePick,
  setProfileImage,
  nickname,
  onChangeNickname,
  bio,
  onChangeBio,
  onSave,
  isPending,
  t,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 박스 */}
      <div className="relative w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-t-[28px] sm:rounded-2xl p-6 flex flex-col z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{t.editModalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center hover:bg-[#3A3A3C] transition cursor-pointer text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="flex flex-col gap-4 mb-6">
          {/* 아바타 이미지 선택 */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={onImagePick}
                className="relative group cursor-pointer block"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-20 h-20  rounded-full border-2 border-[#bef408] object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-[#bef408] bg-zinc-800 flex items-center justify-center text-white">
                    <User className="w-10 h-10" />
                  </div>
                )}

                {!profileImage && (
                  <div className="absolute right-0 bottom-0 bg-[#bef408] text-black rounded-full p-1.5 shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileImage("");
                  }}
                  className="absolute top-0 -right-1 bg-zinc-800/90 text-white  hover:bg-red-500 border border-white/20 rounded-full p-1 shadow-md transition cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-zinc-400 mt-2">{t.imageHint}</span>
          </div>

          {/* 닉네임 입력 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">
              {t.nicknameLabel}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => onChangeNickname(e.target.value)}
              placeholder={t.nicknamePlaceholder}
              className="bg-[#2C2C2E] rounded-xl px-4 py-3 text-white text-[15px] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#bef408]"
            />
          </div>

          {/* 소개글 입력 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">
              {t.bioLabel}
            </label>
            <textarea
              value={bio}
              onChange={(e) => onChangeBio(e.target.value)}
              placeholder={t.bioPlaceholder}
              rows={3}
              className="bg-[#2C2C2E] rounded-xl px-4 py-3 text-white text-[15px] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#bef408] resize-none"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-[#bef408] text-black font-bold text-base flex items-center justify-center hover:opacity-90 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            t.saveButton
          )}
        </button>
      </div>
    </div>
  );
};
