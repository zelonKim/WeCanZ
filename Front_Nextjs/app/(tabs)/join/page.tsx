"use client";

import { getMyGatherings } from "@/api/gathering/getMyGatherings";
import { getMyInfo } from "@/api/user/getMyInfo";
import { useFlashLanguage } from "@/hooks/Languages/useFlashLanguage";
import { MyGathering } from "@/types/gathering/MyGathering";
import { MyInfo } from "@/types/user/MyInfo";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Clock, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { JoinStatusBadge } from "@/components/JoinStatusBadge";

export default function JoinedPage() {
  const t = useFlashLanguage();
  const router = useRouter();

  const { data: me } = useQuery<MyInfo>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  const {
    data: myGatherings = [],
    isPending,
    isRefetching,
    refetch,
  } = useQuery<MyGathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: getMyGatherings,
    enabled: !!me?.id,
    select: (data) =>
      data.filter((gathering) =>
        ["OPEN", "FULL", "IN_PROGRESS"].includes(gathering.status),
      ),
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* 상단 헤더 */}
      <header className="top-0 z-10 bg-[#121212] backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-white/[0.08]">
        <h1 className="text-3xl font-extrabold text-[#bef408] italic tracking-tight">
          {t.headerTitle}
        </h1>

        <div className="flex items-center gap-2">
          {/* 지난 모임 기록 버튼 */}
          <button
            type="button"
            onClick={() => router.push("/join/done")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full   hover:bg-white/10 active:opacity-70 transition cursor-pointer"
            aria-label="History"
          >
            <Clock className="w-[22px] h-[22px] text-[#bef408]" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 px-5 pt-3.5 pb-24">
        {isPending ? (
          <div className="flex-1 h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#bef408]" />
          </div>
        ) : myGatherings.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <p className="text-[#71717A] text-[15px] font-medium leading-relaxed whitespace-pre-line">
              {t.emptyMessage}
            </p>
          </div>
        ) : (
          <div className="grid gird-cols-1 md:grid-cols-2   gap-4.5">
            {myGatherings.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/gathering/${item.id}`)}
                className="bg-[#1C1C1E] hover:bg-zinc-800/80 rounded-[20px] px-6 pt-5 pb-4 border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.99] transition cursor-pointer shadow-sm"
              >
                {/* 카드 헤더: 제목 + 상태 배지 */}
                <div className="flex justify-between items-center mb-2.5 gap-2.5 ">
                  <h2 className="text-[16px] font-bold text-white truncate flex-1 tracking-tight">
                    {item.title}
                  </h2>
                  {me && <JoinStatusBadge item={item} me={me} t={t} />}
                </div>

                {/* 카드 설명 */}
                {item.description && (
                  <p className="text-sm text-[#A1A1AA] leading-5 line-clamp-2 mb-5.5">
                    {item.description}
                  </p>
                )}

                {/* 카드 푸터: 장소 및 화살표 */}
                {item.location && (
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[13px] text-[#D4D4D8] font-medium truncate">
                        {item.location}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#52525B] shrink-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
