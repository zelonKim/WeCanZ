"use client";

import { DMRoomItemProps } from "@/types/DM/DMRoomItemProps";
import { formatDate } from "@/utils/formatDate";
import React from "react";

export const DMRoomItem = ({
  item,
  renderAvatar,
  onPressItem,
  onLongPressItem,
  lang,
}: DMRoomItemProps) => {
  const partner = item.targetUser;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPressItem(item.id);
  };

  return (
    <div
      onClick={() => onPressItem(item)}
      onContextMenu={handleContextMenu}
      className="flex items-center justify-between py-3 px-4 bg-zinc-900 border border-white/5 rounded-2xl mb-0.5 hover:bg-zinc-800/80 transition cursor-pointer"
    >
      {/* 유저 정보 (아바타 + 텍스트) */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
        {/* 아바타 & 안독 읽음 뱃지 */}
        <div className="relative shrink-0">
          {renderAvatar(partner?.profileImage)}
          {item.hasUnread && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center border-2 border-zinc-900">
              <span className="text-[9px] font-bold text-white leading-none">
                N
              </span>
            </div>
          )}
        </div>

        {/* 닉네임 및 마지막 메시지 */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white truncate">
              {partner?.nickname}
            </span>
            {item.hasUnread && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            )}
          </div>

          {item.lastMessage && (
            <p
              className={`text-xs mt-1 truncate ${
                item.hasUnread ? "font-semibold text-zinc-300" : "text-zinc-400"
              }`}
            >
              {item.lastMessage.content || (item.lastMessage as any).message}
            </p>
          )}
        </div>
      </div>

      {/* 마지막 메시지 시간 */}
      {item.lastMessage?.createdAt && (
        <span className="text-[11px] text-zinc-500 shrink-0 self-start mt-0.5">
          {formatDate(item.lastMessage.createdAt, lang)}
        </span>
      )}
    </div>
  );
};
