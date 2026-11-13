"use client";

import { useNoShowModalLanguage } from "@/hooks/Languages/useNoShowModalLanguage";
import { NoShowModalProps } from "@/types/gathering/NoShowModalProps";
import { X } from "lucide-react";
import React from "react";

export const NoShowModal: React.FC<NoShowModalProps> = ({
  isOpen,
  onClose,
  participants,
  meId,
  noShowMutation,
  handleCompleteCheck,
}) => {
  const { t } = useNoShowModalLanguage();

  if (!isOpen) return null;

  const filteredParticipants = (participants || []).filter(
    (item) =>
      item.userId !== meId &&
      (item.status === "APPROVED" ||
        item.status === "YES_SHOW" ||
        item.status === "NO_SHOW"),
  );

  return (
    <div className="fixed inset-0 z-100 bg-black/75 flex items-center justify-center p-0 sm:p-4">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 모달 박스 */}
      <div className="relative w-full max-w-md bg-[#1C1C1E] border border-white/10 rounded-t-[24px] sm:rounded-2xl p-6 flex flex-col z-10 shadow-2xl max-h-[85vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{t.modalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 참여자 리스트 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 my-2">
          {filteredParticipants.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">
              No participants to check.
            </p>
          ) : (
            filteredParticipants.map((item) => {
              const nickname = item.user?.nickname || t.defaultUser;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-[#2C2C2E] rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">
                      {nickname}
                    </span>
                    {item.status === "NO_SHOW" && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                        {t.noShowBadge}
                      </span>
                    )}
                    {item.status === "YES_SHOW" && (
                      <span className="px-2 py-0.5 rounded bg-[#bef408]/15 text-[#bef408] text-[10px] font-bold">
                        {t.yesShowBadge}
                      </span>
                    )}
                  </div>

                  {item.userId !== meId && item.status !== "NO_SHOW" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `${t.alerts.title}\n\n${t.alerts.message(nickname)}`,
                          )
                        ) {
                          noShowMutation(item.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600/90 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      {t.noShowBtn}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 모달 푸터 (완료 확인 버튼) */}
        <div className="pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={handleCompleteCheck}
            className="w-full py-3.5 rounded-xl bg-[#bef408] hover:opacity-90 text-black font-bold text-sm flex items-center justify-center transition cursor-pointer active:scale-[0.99]"
          >
            {t.completeCheckBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
