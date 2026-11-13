"use client";

import { useGatheringChatMenuLanguage } from "@/hooks/Languages/useGatheringChatMenuLanguage";
import { GatheringChatMenuPopoverProps } from "@/types/gathering/GatheringChatMenuPopoverProps";
import React from "react";

export const GatheringChatMenuPopover = ({
  msg,
  onClose,
  onViewProfile,
  onSendFriendRequest,
  onRequestDm,
  onBlockUser,
}: GatheringChatMenuPopoverProps) => {
  const { t } = useGatheringChatMenuLanguage();

  const userId = msg.user?.id || "";
  const nickname = msg.user?.nickname || "";

  return (
    <>
      {/* 배경 클릭 시 메뉴 닫기 레이어 */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* 팝오버 메뉴 박스 */}
      <div className="absolute left-8 -top-6 z-50 flex flex-col bg-[#2C2C2E] border border-white/15 rounded-2xl p-1.5 shadow-2xl w-36">
        <button
          type="button"
          onClick={() => {
            onClose();
            onViewProfile(userId);
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t.menu.viewProfile}
        </button>

        <div className="h-[1px] bg-white/10 my-1 mx-1" />

        <button
          type="button"
          onClick={() => {
            onClose();
            onSendFriendRequest(userId);
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t.menu.friendRequest}
        </button>

        <div className="h-[1px] bg-white/10 my-1 mx-1" />

        <button
          type="button"
          onClick={() => {
            onClose();
            onRequestDm(userId);
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t.menu.requestDm}
        </button>

        <div className="h-[1px] bg-white/10 my-1 mx-1" />

        <button
          type="button"
          onClick={() => {
            onClose();
            if (
              window.confirm(
                `${t.alerts.blockTitle}\n\n${t.alerts.blockConfirm(nickname)}`,
              )
            ) {
              onBlockUser(userId, nickname);
            }
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#FF5252] hover:bg-red-500/10 transition cursor-pointer"
        >
          {t.menu.block}
        </button>
      </div>
    </>
  );
};
