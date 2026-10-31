"use client";

import { client } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
// 사용 중이신 ionicons 패키지 경로에 맞게 임포트해 주세요 (예: react-ionicons)
import { TimeOutline, LocationOutline } from "react-ionicons";

// 모임 및 참여 정보 타입 정의
export interface Gathering {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime?: string;
  hostId: string;
  status: "OPEN" | "FULL" | "IN_PROGRESS" | "CANCELED" | "COMPLETED";
  participants?: {
    userId: string;
    status: "PENDING" | "APPROVED" | "BANNED" | "YES_SHOW" | "NO_SHOW";
  }[];
}

export default function FlashScreen() {
  const router = useRouter();

  // 1. 내 프로필 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 2. 내가 방장이거나 신청/참여 중인 모임 목록 조회
  const { data: myGatherings = [], isLoading } = useQuery<Gathering[]>({
    queryKey: ["my-gatherings"],
    queryFn: async () => {
      const { data } = await client.get("/gathering/my");
      return data;
    },
    enabled: !!me?.id,
    select: (data) =>
      data.filter((gathering) =>
        ["OPEN", "FULL", "IN_PROGRESS"].includes(gathering.status),
      ),
  });

  // 3. 모임 상세 페이지로 이동
  const handlePressGathering = (gatheringId: string) => {
    router.push(`/gathering/${gatheringId}`);
  };

  // 나의 상태(방장, 승인됨, 대기중) 구분 뱃지 렌더링
  const renderStatusBadge = (gathering: Gathering) => {
    if (String(gathering.hostId) === String(me?.id)) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-yellow-400 text-black text-xs font-bold ">
          👑 방장
        </span>
      );
    }

    const myParticipant = gathering.participants?.find(
      (p) => String(p.userId) === String(me?.id),
    );

    if (myParticipant?.status === "APPROVED") {
      return (
        <span className="px-2.5 py-1 rounded-md bg-green-600 text-white text-xs font-bold">
          ✅ 참여중
        </span>
      );
    }

    if (myParticipant?.status === "PENDING") {
      return (
        <span className="px-2.5 py-1 rounded-md bg-orange-400 text-black text-xs font-bold">
          ⏳ 승인 대기중
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col min-h-screen  text-white max-w-5xl mx-auto px-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between py-3">
        <h1 className="text-[28px] text-[#bef408] font-bold italic">
          Joined Meetup
        </h1>

        {/* 🚀 우측 아이콘 버튼 */}
        <button
          onClick={() => router.push("/join/done")}
          className="p-2  hover:bg-zinc-800 rounded-2xl transition cursor-pointer"
        >
          <TimeOutline color="#bef408" height="25px" width="25px" />
        </button>
      </div>
      <div className="h-[1px] bg-zinc-800 mb-4" />

      {/* 목록 콘텐츠 */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-start py-32">
          <div className="animate-spin text-4xl">
            {" "}
            <Image
              src="/logo/sticker.png"
              alt="WeCanZ_sticker"
              width={80}
              height={80}
            />
          </div>
        </div>
      ) : myGatherings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-zinc-400">
          <p className="text-base">현재 참여 중인 밋업이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {myGatherings.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePressGathering(item.id)}
              className="bg-[#1e1e1e] border border-[#333] p-5 rounded-2xl cursor-pointer hover:border-[#bef408] transition flex flex-col justify-between"
            >
              <div>
                {renderStatusBadge(item)}
                <div className="flex justify-between items-center my-1">
                  <h2 className="text-lg font-bold text-white truncate mr-2">
                    {item.title}
                  </h2>
                </div>

                {item.description ? (
                  <p className="text-base text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                ) : null}
              </div>

              <div className="h-[1px] bg-zinc-800 mb-1" />
              {item.location && (
                <div className="flex items-center gap-1.5 text-sm text-zinc-300 mt-2">
                  <LocationOutline
                    color="oklch(76.5% 0.177 163.223)"
                    height="14px"
                    width="14px"
                  />
                  <span className="truncate">{item.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
