"use client";

import { getMyGatherings } from "@/api/gathering/getMyGatherings";
import { getMyInfo } from "@/api/user/getMyInfo";
import { useMeetupHistoryLanguage } from "@/hooks/Languages/useMeetupHistoryLanguage";
import { MyGathering } from "@/types/gathering/MyGathering";
import { TabType } from "@/types/joined/TabType";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function DoneGatheringsPage() {
  const { t } = useMeetupHistoryLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("COMPLETED");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  const { data: doneGatherings = [] } = useQuery<MyGathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: getMyGatherings,
    enabled: !!me?.id,
    select: (data) =>
      data.filter((item) => ["COMPLETED", "CANCELED"].includes(item.status)),
  });

  const currentList = doneGatherings.filter(
    (item) => item.status === activeTab,
  );

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center">
      <div className=" w-full max-w-5xl flex flex-col min-h-screen bg-[#121212]">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-10 bg-[#121212]/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-white hover:opacity-70 transition cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white italic">
            {t.headerTitle}
          </h1>
          <div className="w-6" />
        </header>

        {/* 탭 바 */}
        <div className="flex border-b border-[#2A2A2A]">
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex-1 py-3 text-[15px] text-center transition cursor-pointer ${
              activeTab === "COMPLETED"
                ? "border-b-2 border-[#bef408] text-[#bef408] font-bold"
                : "text-[#777777] hover:text-white/80 hover:bg-zinc-800/20"
            }`}
          >
            {t.completedTab}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CANCELED")}
            className={`flex-1 py-3 text-[15px] text-center transition cursor-pointer ${
              activeTab === "CANCELED"
                ? "border-b-2 border-red-500 text-red-500 font-bold"
                : "text-[#777777] hover:text-white/80 hover:bg-zinc-800/20 "
            }`}
          >
            {t.canceledTab}
          </button>
        </div>

        {/* 모임 히스토리 리스트 */}
        <main className="flex-1 p-4">
          {currentList.length === 0 ? (
            <div className="pt-60 flex items-center justify-center text-center">
              <p className="text-base text-[#666666]">
                {activeTab === "COMPLETED" ? t.emptyCompleted : t.emptyCanceled}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4.5">
              {currentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/gathering/${item.id}`)}
                  className="bg-[#1C1C1E] hover:bg-zinc-800/80  border rounded-[20px] px-6 pt-5 pb-4  border-white/[0.08] hover:border-white/[0.18] active:scale-[0.99] transition cursor-pointer"
                >
                  <h2 className="text-base font-bold text-white truncate mb-1.5">
                    {item.title}
                  </h2>

                  <p className="text-sm text-[#B0B0B0] leading-5 line-clamp-2 mb-5.5">
                    {item.description || t.noDescription}
                  </p>

                  <div className="flex items-center gap-1 pt-3 border-t border-white/[0.05]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[13px] text-[#A0A0A0] truncate">
                      {item.location || t.noLocation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
