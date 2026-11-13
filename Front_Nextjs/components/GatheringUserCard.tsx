"use client";

import { useGatheringUserCardLanguage } from "@/hooks/Languages/useGatheringUserCardLanguage";
import { GatheringUserCardProps } from "@/types/gathering/GatheringUserCardProps";
import { CheckSquare, Hourglass, User, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export const GatheringUserCard: React.FC<GatheringUserCardProps> = ({
  user,
  roleTag,
  participantId,
  currentStatus,
  me,
  gathering,
  isHost,
  activeMenuUserId,
  setActiveMenuUserId,
  handleCloseMenu,
  sendFriendRequestMutation,
  requestDmMutation,
  blockUserMutation,
  pendingMutation,
  approveMutation,
  banMutation,
}) => {
  const router = useRouter();
  const { t } = useGatheringUserCardLanguage();

  const isMe = String(user?.id) === String(me?.id);
  const isMenuOpen = activeMenuUserId === user?.id;
  const isUserHost = String(user?.id) === String(gathering?.hostId);
  const displayRoleTag = roleTag || (isUserHost ? t.hostBadge : undefined);

  return (
    <div
      className={`relative flex items-center justify-between p-3.5 bg-[#18181B] border border-white/[0.08] rounded-2xl mb-1 transition ${
        isMenuOpen ? "z-50" : "z-10"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 relative">
        {/* 아바타 버튼 및 팝오버 메뉴 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (user && !isMe) {
                setActiveMenuUserId(isMenuOpen ? null : user.id);
              }
            }}
            className={`relative rounded-full overflow-hidden block ${
              !isMe ? "cursor-pointer hover:opacity-80" : "cursor-default"
            }`}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.nickname || "User"}
                className="w-11 h-11 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-white/10">
                <User className="w-5 h-5 text-zinc-400" />
              </div>
            )}
          </button>

          {/* 유저 클릭 시 나타나는 팝오버 메뉴 */}
          {isMenuOpen && user && (
            <>
              {/* 배경 클릭 시 닫기 위한 레이어 */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseMenu();
                }}
              />

              <div className="absolute left-14 top-0 z-50 flex flex-col bg-[#2C2C2E] border border-white/15 rounded-2xl p-1.5 shadow-xl w-36">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseMenu();
                    router.push(`/profile/${user.id}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  {t.viewProfile}
                </button>

                <div className="h-[1px] bg-white/10 my-1 mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    handleCloseMenu();
                    sendFriendRequestMutation(user.id);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  {t.friendRequest}
                </button>

                <div className="h-[1px] bg-white/10 my-1 mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    handleCloseMenu();
                    requestDmMutation(user.id);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  {t.dmRequest}
                </button>

                <div className="h-[1px] bg-white/10 my-1 mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    handleCloseMenu();
                    if (
                      window.confirm(
                        `${t.alerts.blockTitle}\n\n${t.alerts.blockMsg(
                          user.nickname || "",
                        )}`,
                      )
                    ) {
                      blockUserMutation(user.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#FF5252] hover:bg-red-500/10 transition cursor-pointer"
                >
                  {t.block}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 유저 정보 (닉네임, 뱃지, 통계) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white truncate">
              {user?.nickname}
            </span>
            {displayRoleTag && (
              <span className="px-2 py-0.5 rounded-md bg-[#bef408]/15 text-[#bef408] text-[10px] font-extrabold shrink-0">
                {displayRoleTag}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            {t.stats(user?.yesShowCount ?? 0, user?.noShowCount ?? 0)}
          </span>
        </div>

        {/* 호스트 전용 관리 버튼 (승인/대기/추방) */}
        {isHost &&
          !isUserHost &&
          participantId &&
          gathering &&
          (gathering.status === "OPEN" || gathering.status === "FULL") && (
            <div className="flex items-center gap-1.5 shrink-0">
              {currentStatus === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => pendingMutation(participantId)}
                  className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center justify-center transition cursor-pointer"
                  title="Move to Pending"
                >
                  <Hourglass className="w-4 h-4" />
                </button>
              )}

              {currentStatus === "PENDING" && (
                <button
                  type="button"
                  onClick={() => approveMutation(participantId)}
                  className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition cursor-pointer"
                  title="Approve"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(`${t.alerts.banTitle}\n\n${t.alerts.banMsg}`)
                  ) {
                    banMutation(participantId);
                  }
                }}
                className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition cursor-pointer"
                title="Ban"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
