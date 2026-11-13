"use client";

import { MyInfo } from "@/types/user/MyInfo";
import { formatTime } from "@/utils/formatTime";
import { User } from "lucide-react";
import React from "react";

interface GatheringChatMessageItemProps {
  msg: any;
  me?: MyInfo | null;
  currentLang: string;
  activeMenuMessageId: string | null;
  onToggleMenu: (msgId: string) => void;
  onDeleteMessage: (msg: any) => void;
  onOpenImageModal: (uri: string) => void;
  renderMenuPopover?: (msg: any) => React.ReactNode;
}

export const GatheringChatMessageItem = ({
  msg,
  me,
  currentLang,
  activeMenuMessageId,
  onToggleMenu,
  onDeleteMessage,
  onOpenImageModal,
  renderMenuPopover,
}: GatheringChatMessageItemProps) => {
  const isMyMessage =
    String(msg.userId || msg.senderId) === String(me?.id) ||
    String(msg.sender?.id) === String(me?.id);

  const formattedTime = formatTime(msg.createdAt, currentLang);

  const senderInfo = msg.user || msg.sender;
  const senderNickname = senderInfo?.nickname || "";
  const senderProfileImage = senderInfo?.profileImage;
  const isMenuOpen = activeMenuMessageId === msg.id;

  // 웹에서 우클릭 시 삭제 메뉴 실행 (모바일의 onLongPress 대체)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onDeleteMessage(msg);
  };

  return (
    <div
      className={`flex flex-col mb-4 max-w-[80%] ${
        isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      {/* 상대방 프로필 및 닉네임 */}
      {!isMyMessage && (
        <div className="flex items-center gap-2 mb-1.5 relative">
          <button
            type="button"
            onClick={() => {
              if (senderInfo && senderInfo.id !== me?.id) {
                onToggleMenu(msg.id);
              }
            }}
            className="rounded-full overflow-hidden focus:outline-none cursor-pointer"
          >
            {senderProfileImage ? (
              <img
                src={senderProfileImage}
                alt={senderNickname}
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
          <span className="text-xs text-zinc-400 font-semibold">
            {senderNickname}
          </span>
        </div>
      )}

      {/* 메뉴 팝업 (클릭 시 노출) */}
      {isMenuOpen && senderInfo && renderMenuPopover && (
        <div className="relative z-30">{renderMenuPopover(msg)}</div>
      )}

      {/* 메시지 말풍선 및 타임스탬프 Row */}
      <div
        className={`flex items-end gap-1.5 ${
          isMyMessage ? "flex-row" : "justify-end"
        }`}
      >
        {/* 내 메시지 타임스탬프 */}
        {isMyMessage && (
          <span className="text-[10px] text-zinc-500 mb-0.5 shrink-0">
            {formattedTime}
          </span>
        )}

        {/* 메시지 본문 (텍스트 / 이미지) */}
        <div
          onContextMenu={handleContextMenu}
          className={`flex flex-col gap-1.5 ${
            isMyMessage ? "items-end" : "items-start"
          } max-w-full`}
        >
          {/* 이미지 첨부 */}
          {msg.imageUrl && (
            <div className="mb-2">
              <img
                src={msg.imageUrl}
                alt="Chat Attachment"
                onClick={() => onOpenImageModal(msg.imageUrl || "")}
                className={`rounded-xl object-cover cursor-pointer hover:opacity-95 transition ${
                  !msg.message ? "w-40 h-40" : "w-40 h-40"
                }`}
              />
            </div>
          )}

          {/* 텍스트 메시지 */}
          {msg.message ? (
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                isMyMessage
                  ? "bg-[#bef408] text-black font-medium rounded-br-sm"
                  : "bg-white/10 text-zinc-100 font-normal rounded-bl-sm border border-white/10"
              }`}
            >
              {msg.message}
            </div>
          ) : null}
        </div>
        {!isMyMessage && (
          <span className="text-[10px] text-zinc-500 mb-0.5 shrink-0">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};
