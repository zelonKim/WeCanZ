"use client";

import { HOURS } from "@/constants/HOURS";
import { MINUTES } from "@/constants/MINUTES";
import { useGatheringModalLanguage } from "@/hooks/Languages/useGatheringModalLanguage";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
import { getTodayString } from "@/utils/getTodayString";
import { Loader2, X } from "lucide-react";
import React, { useMemo } from "react";

interface GatheringModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  category: GatheringCategory;
  setCategory: (category: GatheringCategory) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  selectedDateStr: string;
  selectedHour: number;
  setSelectedHour: (hour: number) => void;
  selectedMinute: number;
  setSelectedMinute: (minute: number) => void;
  maxPeople: number | string;
  setMaxPeople: (people: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  handleDayPress: (day: { dateString: string }) => void;
}

export const GatheringModal: React.FC<GatheringModalProps> = ({
  mode,
  isOpen,
  onClose,
  category,
  setCategory,
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  selectedDateStr,
  selectedHour,
  setSelectedHour,
  selectedMinute,
  setSelectedMinute,
  maxPeople,
  setMaxPeople,
  onSubmit,
  isPending,
  handleDayPress,
}) => {
  const { t } = useGatheringModalLanguage();

  if (!isOpen) return null;

  const modalTitle = mode === "create" ? t.newMeetup : t.editMeetup;
  const submitButtonText = mode === "create" ? t.createBtn : t.editBtn;

  return (
    <div className="fixed inset-0 z-100 bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#18181B] border border-white/10 rounded-t-[28px] sm:rounded-2xl p-6 max-h-[88vh] flex flex-col z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5 pb-2 border-b border-white/5">
          <h2 className="text-xl font-extrabold text-white">{modalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27272A] flex items-center justify-center hover:bg-[#3F3F46] transition cursor-pointer text-[#A1A1AA] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-2 pb-6 flex flex-col gap-4 scrollbar-none">
          {/* 카테고리 선택 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.categoryLabel}
            </label>
            <div className="flex gap-2">
              {[
                { label: t.us, value: GatheringCategory.US },
                { label: t.uk, value: GatheringCategory.UK },
                { label: t.kr, value: GatheringCategory.KR },
              ].map((opt) => {
                const isActive = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`flex-1 py-3 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#bef408] text-black"
                        : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.titleLabel}
            </label>
            <input
              type="text"
              className="bg-[#27272A] rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#bef408]"
              placeholder={t.titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 설명 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.descLabel}
            </label>
            <textarea
              className="bg-[#27272A] rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#bef408] h-20 resize-none"
              placeholder={t.descPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 장소 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.locationLabel}
            </label>
            <input
              type="text"
              className="bg-[#27272A] rounded-xl px-4 py-3.5 text-white text-[15px] placeholder-[#71717A] focus:outline-none focus:ring-1 focus:ring-[#bef408]"
              placeholder={t.locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* 📅 웹 표준 브라우저 기본 팝업 날짜 입력창 */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.dateLabel}
            </label>
            <input
              type="date"
              min={getTodayString()}
              className="bg-[#27272A] rounded-xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus:ring-1 focus:ring-[#bef408] [color-scheme:dark] cursor-pointer"
              value={selectedDateStr}
              onChange={(e) => handleDayPress({ dateString: e.target.value })}
            />
          </div>

          {/* ⏰ 시각 및 분 선택 UI */}
          <div className="flex flex-col gap-3">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.timeLabel}
            </label>

            {/* 상단: 선택된 시각 대형 실시간 프리뷰 박스 */}
            <div className="w-full h-[72px] rounded-2xl border border-[#bef408] bg-[#27272A]/40 flex items-center justify-center gap-2 shadow-inner">
              <span className="text-3xl font-extrabold text-[#bef408] tracking-wider">
                {String(selectedHour).padStart(2, "0")}
              </span>
              <span className="text-3xl font-extrabold text-[#bef408]">:</span>
              <span className="text-3xl font-extrabold text-[#bef408] tracking-wider">
                {String(selectedMinute).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#71717A]">
                {t.hour}
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {HOURS.map((i) => {
                  const isSelected = selectedHour === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedHour(i)}
                      className={`min-w-[62px] h-[40px] rounded-xl text-sm font-extrabold transition shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#bef408] text-black shadow-lg shadow-[#bef408]/20"
                          : "bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]"
                      }`}
                    >
                      {String(i).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 분(Minute) 선택 버튼 그룹 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#71717A]">
                {t.minute}
              </span>
              <div className="flex gap-2.5">
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      className={`flex-1  h-[40px] rounded-xl text-sm font-extrabold transition cursor-pointer ${
                        isSelected
                          ? "bg-[#bef408] text-black shadow-lg shadow-[#bef408]/20"
                          : "bg-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#3F3F46]"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 최대 인원 */}
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-[13px] font-bold text-[#A1A1AA]">
              {t.maxPeopleLabel}
            </label>
            <input
              type="number"
              className="bg-[#27272A] rounded-xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus:ring-1 focus:ring-[#bef408]"
              value={String(maxPeople ?? "")}
              onChange={(e) => setMaxPeople(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="w-full mt-4 py-4 rounded-xl bg-[#bef408] text-black font-extrabold text-base flex items-center justify-center hover:opacity-90 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </div>
  );
};
