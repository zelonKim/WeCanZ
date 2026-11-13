"use client";

import { BlockManagementModalProps } from "@/types/friend/BlockManagementModalProps";
import { X, RefreshCw } from "lucide-react";
import React from "react";

export const BlockManagementModal = ({
  visible,
  onClose,
  blockNickname,
  setBlockNickname,
  onBlockSubmit,
  blockedUsers,
  isBlockedLoading,
  onRefreshBlocked,
  onUnblock,
  renderAvatar,
  t,
}: BlockManagementModalProps) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* 모달 카드 박스 (내부 클릭 시 닫힘 방지) */}
      <div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <h3 className="text-lg font-bold text-white">{t.blockModalTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 직접 닉네임 입력 후 차단 영역 */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder={t.nicknamePlaceholder}
            value={blockNickname}
            onChange={(e) => setBlockNickname(e.target.value)}
            autoCapitalize="none"
            className="flex-1 bg-zinc-800 border border-white/10 h-11 rounded-xl px-3.5 text-white text-sm outline-none focus:border-[#bef408] transition"
          />
          <button
            type="button"
            onClick={onBlockSubmit}
            className="px-4 h-11 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition cursor-pointer shrink-0"
          >
            {t.blockBtnText}
          </button>
        </div>

        <div className="h-[1px] bg-white/10 my-2" />

        {/* 차단된 유저 목록 타이틀 및 새로고침 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-300">
            {t.blockedListTitle(blockedUsers.length)}
          </span>
        </div>

        {/* 차단된 유저 리스트 영역 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto max-h-[350px] flex flex-col gap-2.5 pr-1">
          {blockedUsers.length === 0 ? (
            <div className="p-6 items-center justify-center bg-zinc-800/50 border border-white/5 rounded-xl text-center">
              <span className="text-sm text-zinc-400">{t.emptyBlocked}</span>
            </div>
          ) : (
            blockedUsers.map((item) => {
              const user = item.receiver || (item as any);
              const targetUserId = user.id || item.id;
              const userName = user.nickname || "알 수 없음";

              return (
                <div
                  key={targetUserId}
                  className="flex items-center justify-between p-3 bg-zinc-800/80 border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="shrink-0">
                      {renderAvatar(user.profileImage)}
                    </div>
                    <span className="text-sm font-semibold text-white truncate">
                      {userName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `${t.alerts.unblockConfirmTitle}\n\n${t.alerts.unblockConfirmMsg(
                            userName,
                          )}`,
                        )
                      ) {
                        onUnblock(targetUserId);
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                  >
                    {t.unblockBtn}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
