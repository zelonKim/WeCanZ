"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { IoArrowBack, IoPerson, IoClose } from "react-icons/io5"; // Ionicons 사용
import { client } from "@/api/client";

interface UserProfile {
  id: string;
  profileImage?: string;
  nickname: string;
  bio?: string;
  noShowCount: number;
  yesShowCount: number;
  createdAt: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile", id],
    queryFn: async () => {
      const { data } = await client.get(`/user/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#121212] text-white">
        <header className="flex items-center border-b border-[#2C2C2E] px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-1 text-white hover:opacity-80"
          >
            <IoArrowBack size={28} />
          </button>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-lg font-medium text-white">
            유저 정보를 불러올 수 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-[#333] px-5 py-2.5 text-base font-bold text-white hover:bg-[#444]"
          >
            뒤로가기
          </button>
        </main>
      </div>
    );
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "-";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#121212] text-white">
      {/* 상단 네비게이션바 */}
      <header className="flex items-center justify-between border-b border-[#2C2C2E] px-4 py-3.5">
        <button
          onClick={() => router.back()}
          className="p-1 text-white hover:opacity-80"
        >
          <IoArrowBack size={28} />
        </button>
        <h1 className="text-xl font-bold">프로필 보기</h1>
        <div className="w-7" />
      </header>

      <main className="flex flex-col gap-7 p-6">
        {/* 상단 프로필 이미지 & 닉네임 */}
        <section className="mt-3 flex flex-col items-center gap-3">
          {user.profileImage ? (
            <button
              onClick={() => setIsModalVisible(true)}
              className="cursor-pointer relative h-28 w-28 overflow-hidden rounded-full border-none bg-[#2C2C2E] focus:outline-none"
            >
              <Image
                src={user.profileImage}
                alt={user.nickname}
                fill
                className="object-cover"
              />
            </button>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#2C2C2E]">
              <IoPerson size={48} className="text-gray-300" />
            </div>
          )}

          <h2 className="text-3xl font-bold">{user.nickname}</h2>
          <p className="px-4 text-center text-base text-[#8E8E93]">
            {user.bio || "등록된 자기소개가 없습니다."}
          </p>
        </section>

        {/* 활동 통계 (참석 / 노쇼 횟수) */}
        <section className="flex items-center justify-around rounded-xl bg-[#1C1C1E] py-5">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-medium text-[#8E8E93]">예스쇼</span>
            <span className="text-2xl font-bold text-yellow-400">
              {user.yesShowCount}회
            </span>
          </div>
          <div className="h-7 w-px bg-[#2C2C2E]" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-sm font-medium text-[#8E8E93]">노쇼</span>
            <span className="text-2xl font-bold text-[#FF453A]">
              {user.noShowCount}회
            </span>
          </div>
        </section>

        {/* 상세 정보 카드 */}
        <section className="flex flex-col gap-3 rounded-xl bg-[#1C1C1E] p-5">
          <div className="flex items-center justify-between">
            <span className="text-base text-[#8E8E93]">가입일</span>
            <span className="text-base font-semibold text-white">
              {formattedDate}
            </span>
          </div>
        </section>
      </main>

      {/* 프로필 사진 확대 보기 모달 */}
      {isModalVisible && user.profileImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsModalVisible(false)}
        >
          <div className="relative flex h-full w-full max-w-lg items-center justify-center">
            <div className="relative h-[70%] w-[90%]">
              <Image
                src={user.profileImage}
                alt={`${user.nickname} profile full`}
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setIsModalVisible(false)}
              className="absolute top-6 right-5 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/30"
            >
              <IoClose size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
