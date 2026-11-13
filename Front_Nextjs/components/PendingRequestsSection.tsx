"use client";

import React from "react";

interface PendingRequestsSectionProps {
  pendingRequests: any[];
  t: any;
  renderAvatar: (uri?: string) => React.ReactNode;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const PendingRequestsSection = ({
  pendingRequests,
  t,
  renderAvatar,
  onAccept,
  onReject,
}: PendingRequestsSectionProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* 섹션 타이틀 */}
      <div className="mb-1">
        <h2 className="text-base font-bold text-white">
          {t.pendingHeader(pendingRequests.length)}
        </h2>
      </div>

      {/* 대기 중인 요청 목록이 없을 때 */}
      {pendingRequests.length === 0 ? (
        <div className="p-6 items-center justify-center bg-zinc-900 border border-white/5 rounded-2xl text-center">
          <span className="text-sm text-zinc-400">{t.emptyPending}</span>
        </div>
      ) : (
        /* 요청 목록 렌더링 */
        pendingRequests.map((req) => {
          const requester = req.sender || req.user1;

          return (
            <div
              key={req.id}
              className="flex items-center justify-between p-3.5 bg-zinc-900 border border-white/5 rounded-2xl gap-3"
            >
              {/* 유저 정보 (아바타 + 닉네임) */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0">
                  {renderAvatar(requester?.profileImage)}
                </div>
                <span className="text-sm font-semibold text-white truncate">
                  {requester?.nickname || ""}
                </span>
              </div>

              {/* 수락 / 거절 버튼 그룹 */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onAccept(req.id)}
                  className="px-3.5 py-2 bg-[#bef408] text-black text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  {t.accept}
                </button>

                <button
                  type="button"
                  onClick={() => onReject(req.id)}
                  className="px-3.5 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20 transition cursor-pointer"
                >
                  {t.reject}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
