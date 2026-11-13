"use client";

import { STATUS_STYLE } from "@/constants/STATUS_STYLE";
import { Gathering } from "@/types/gathering/Gathering";
import { GatheringStatus } from "@/types/gathering/GatheringStatus";
import { formatDateTime } from "@/utils/formatDateTime";
import { getCategoryLabel } from "@/utils/getCategoryLabel";
import { Clock, MapPin, Users, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface MeetupItemProps {
  item: Gathering;
  t: any;
  currentLang: string;
}

const GREEN_COLOR = "#bef408";

export const MeetupItem: React.FC<MeetupItemProps> = ({
  item,
  t,
  currentLang,
}) => {
  const router = useRouter();

  const statusStyle = STATUS_STYLE(t)[item.status as GatheringStatus];

  return (
    <div
      onClick={() => router.push(`/gathering/${item.id}`)}
      className=" bg-[#1C1C1E] hover:bg-zinc-800/80  rounded-[20px] p-[18px]  border border-white/[0.08] hover:border-white/[0.15] transition cursor-pointer shadow-md"
    >
      {/* 카드 헤더 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {/* 상태 배지 */}
          <div
            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold ${
              statusStyle?.className || "bg-[#27272A] text-white"
            }`}
          >
            {statusStyle?.label || item.status}
          </div>
          {/* 카테고리 레이블 */}
          <span className="text-xs font-semibold text-[#8E8E93]">
            {getCategoryLabel(t, item.category)}
          </span>
        </div>

        {/* 인원 배지 */}
        <div className="flex items-center gap-1 bg-[#27272A] px-2 py-0.5 rounded-[10px]">
          <Users className="w-[13px] h-[13px] text-[#A1A1AA]" />
          <span className="text-[11px] text-[#D4D4D8] font-semibold">
            {item.maxPeople}
            {t.people}
          </span>
        </div>
      </div>

      {/* 제목 및 설명 */}
      <h3 className="text-[17px] font-semibold text-[#f3f4f6] mb-1.5 tracking-tight">
        {item.title}
      </h3>
      <p className="text-sm text-[#A1A1AA] leading-relaxed line-clamp-2 mb-4">
        {item.description}
      </p>

      {/* 카드 푸터 (시간, 위치 및 호스트 아바타) */}
      <div className="flex justify-between items-end pt-3 border-t border-white/[0.05]">
        <div className="flex flex-col gap-1">
          {/* 날짜 및 시간 */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: GREEN_COLOR }} />
            <span className="text-xs text-[#D4D4D8] font-medium">
              {formatDateTime(item.dateTime, currentLang)}
            </span>
          </div>

          {/* 장소 */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-[#D4D4D8] font-normal">
              {item.location}
            </span>
          </div>
        </div>

        {/* 호스트 프로필 이미지 또는 기본 아이콘 */}
        <div className="flex justify-end">
          {item.host?.profileImage ? (
            <div className="relative w-10 h-10 rounded-[18px] overflow-hidden">
              <Image
                src={item.host.profileImage}
                alt={"Host"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-[36px] h-[36px] rounded-[18px] bg-[#27272A] flex items-center justify-center">
              <User className="w-[18px] h-[18px] text-[#A1A1AA]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
