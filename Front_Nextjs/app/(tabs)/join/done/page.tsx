"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoLocationOutline } from "react-icons/io5";

import { client } from "@/api/client";

type TabType = "COMPLETED" | "CANCELED";

interface Gathering {
  id: string | number;
  title: string;
  description?: string;
  location?: string;
  status: "COMPLETED" | "CANCELED" | string;
}

export default function DoneGatheringsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("COMPLETED");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const { data: doneGatherings = [], isLoading } = useQuery<Gathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: async () => {
      const { data } = await client.get("/gathering/my");
      return data;
    },
    enabled: !!me?.id,
    select: (data) =>
      data.filter((item) => ["COMPLETED", "CANCELED"].includes(item.status)),
  });

  const currentList = doneGatherings.filter(
    (item) => item.status === activeTab,
  );

  return (
    <div className=" min-h-screen  text-white max-w-5xl mx-auto shadow-2xl flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 hover:bg-neutral-800 rounded-full transition"
        >
          <IoArrowBack size={24} className="text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">지난 벙개 내역</h1>
        <div className="w-6" />
      </header>

      {/* 탭 버튼 */}
      <nav className="flex border-b border-neutral-800 shrink-0">
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex-1 py-3.5 text-center text-base font-medium transition-colors ${
            activeTab === "COMPLETED"
              ? "text-orange-500 border-b-2 border-orange-500 font-bold"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          종료된 벙개
        </button>

        <button
          onClick={() => setActiveTab("CANCELED")}
          className={`flex-1 py-3.5 text-center text-base font-medium transition-colors ${
            activeTab === "CANCELED"
              ? "text-red-500 border-b-2 border-red-500 font-bold"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          취소된 벙개
        </button>
      </nav>

      {/* 카드 리스트 */}
      <main className=" flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 text-base">
            {activeTab === "COMPLETED"
              ? "종료된 모임이 없습니다."
              : "취소된 모임이 없습니다."}
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 space-y-3">
            {currentList.map((item) => (
              <li key={item.id}>
                <div
                  onClick={() => router.push(`/gathering/${item.id}`)}
                  className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4 cursor-pointer hover:border-neutral-600 transition"
                >
                  <h2 className="text-base font-bold text-white truncate mb-1.5">
                    {item.title}
                  </h2>

                  <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-2.5">
                    {item.description || "상세 내용이 없습니다."}
                  </p>

                  <div className="h-[1px] bg-zinc-800 mb-3" />

                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <IoLocationOutline className="text-red-500 text-sm shrink-0" />
                    <span className="truncate">
                      {item.location || "장소 미정"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
