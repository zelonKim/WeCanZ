"use client";

import { FriendItemRowProps } from "@/types/friend/FriendItemProps";
import { MessageSquareText, UserMinus } from "lucide-react";
import React from "react";

export const FriendItemRow = ({
  item,
  t,
  renderAvatar,
  onRequestDm,
  onBlockUser,
}: FriendItemRowProps) => {
  const friend = item.friendUser || (item as any);
  const targetUserId = friend.id || item.id;

  return (
    <div className="flex items-center justify-between p-3.5 bg-zinc-900 border border-white/5 rounded-2xl mb-0.5 gap-3 hover:bg-zinc-800/80 transition">
      {/* 유저 정보 (아바타 + 닉네임) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="shrink-0">{renderAvatar(friend.profileImage)}</div>
        <span className="text-sm font-semibold text-white truncate">
          {friend.nickname}
        </span>
      </div>

      {/* 액션 버튼 그룹 (DM 보내기 / 차단) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* DM 보내기 버튼 */}
        <button
          type="button"
          onClick={() => onRequestDm(targetUserId, friend)}
          className="p-2 rounded-xl bg-[#bef408] text-black hover:opacity-90 transition cursor-pointer"
          title="DM 보내기"
        >
          <MessageSquareText className="w-5 h-5" />
        </button>

        {/* 차단 버튼 */}
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `${t.alerts.blockConfirmTitle}\n\n${t.alerts.blockConfirmMsg(
                  friend.nickname,
                )}`,
              )
            ) {
              onBlockUser(targetUserId);
            }
          }}
          className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition cursor-pointer"
          title="차단하기"
        >
          <UserMinus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
