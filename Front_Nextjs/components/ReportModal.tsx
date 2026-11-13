"use client";

import { useReportLanguage } from "@/hooks/Languages/useReportLanguage";
import { ReportModalProps } from "@/types/user/ReportModalProps";
import { ReportReason } from "@/types/user/ReportReason";
import { Loader2, X } from "lucide-react";
import React from "react";

export const ReportModal = ({
  visible,
  onClose,
  targetNickname,
  onChangeTargetNickname,
  selectedReason,
  onSelectReason,
  reportDetails,
  onChangeReportDetails,
  onSubmit,
  isSubmitting,
  isEditable = true,
}: ReportModalProps) => {
  const { t } = useReportLanguage();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1C1C1E] border border-white/10 rounded-t-[20px] sm:rounded-2xl p-5 sm:p-6 flex flex-col z-10 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{t.reportModalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-5.5 mb-4">
          {/* 신고 대상 */}
          <div className="flex flex-col gap-2 mx-1">
            <label className="text-xs font-semibold text-zinc-400 ml-1">
              {t.reportTargetLabel}
            </label>
            <input
              type="text"
              value={targetNickname}
              onChange={(e) => onChangeTargetNickname?.(e.target.value)}
              disabled={!isEditable}
              placeholder={t.reportTargetPlaceholder}
              className={`w-full bg-[#2C2C2E] rounded-xl  px-4 py-3 text-white text-[15px] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
                !isEditable
                  ? "bg-[#242426]/60 text-zinc-400 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>

          {/* 신고 사유 선택 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 ml-1">
              {t.reportReasonLabel}
            </label>
            <div className="flex flex-wrap gap-2 mx-1">
              {Object.values(ReportReason).map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => onSelectReason(reason)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-red-500/15 border-red-500 text-red-500 font-semibold"
                        : "bg-[#2C2C2E] border-transparent text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                  >
                    {t.reportReasonLabels[reason]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="flex flex-col gap-2 mx-1 mb-2">
            <label className="text-xs font-semibold text-zinc-400 ml-1">
              {t.reportDetailsLabel}
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => onChangeReportDetails(e.target.value)}
              placeholder={t.reportDetailsPlaceholder}
              rows={4}
              className="w-full bg-[#2C2C2E] rounded-xl px-4 py-3 text-white text-[15px] placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>
        </div>

        {/* 제출 버튼 (하단 고정) */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base flex items-center justify-center transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            t.reportSubmitButton
          )}
        </button>
      </div>
    </div>
  );
};
