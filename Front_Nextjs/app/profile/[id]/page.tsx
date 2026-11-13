"use client";

import { getUserDetail } from "@/api/user/getUserDetail";
import { useProfileLanguage } from "@/hooks/Languages/useProfileLanguage";
import { UserDetail } from "@/types/user/UserDetail";
import { formatDateYear } from "@/utils/formatDateYear";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User as UserIcon, X, Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function UserProfilePage() {
  const { t, currentLang } = useProfileLanguage();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: user,
    isPending,
    error,
  } = useQuery<UserDetail>({
    queryKey: ["userDetail", id],
    queryFn: () => getUserDetail(id),
    enabled: !!id,
  });

  if (isPending) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#bef408]" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
        <header className="flex items-center px-4 py-3.5 border-b border-[#2C2C2E] bg-[#121212] shrink-0">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-2xl hover:bg-white/10 transition cursor-pointer text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-white text-base">{t.notUserInfo}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#333] hover:bg-[#444] px-4 py-2.5 rounded-xl text-white font-bold text-sm transition cursor-pointer"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex flex-col min-h-screen bg-[#121212] text-white">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-[#2C2C2E] bg-[#121212] shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-lg hover:bg-white/5 transition cursor-pointer text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-base font-bold">{t.headerTitle}</h1>
        <div className="w-6" /> {/* 좌우 대칭용 여백 */}
      </header>

      {/* 메인 콘텐츠 영역 (중앙 정렬 컨테이너) */}
      <div className="flex-1 p-6 max-w-xl mx-auto w-full flex flex-col gap-6">
        {/* 프로필 헤더 섹션 */}
        <div className="flex flex-col items-center gap-2.5 mt-3">
          {user.profileImage ? (
            <div
              onClick={() => setIsModalVisible(true)}
              className="cursor-pointer transition hover:opacity-90"
            >
              <img
                src={user.profileImage}
                alt={user.nickname}
                className="w-[100px] h-[100px] rounded-full object-cover bg-[#2C2C2E]"
              />
            </div>
          ) : (
            <div className="w-[100px] h-[100px] rounded-full bg-[#2C2C2E] flex items-center justify-center text-zinc-400">
              <UserIcon className="w-10 h-10" />
            </div>
          )}

          <h2 className="text-[22px] font-bold text-white tracking-tight">
            {user.nickname}
          </h2>
          <p className="text-sm text-[#8E8E93] text-center px-5 leading-relaxed">
            {user.bio || t.defaultBio}
          </p>
        </div>

        {/* 통계 카드 (예스쇼 / 노쇼) */}
        <div className="flex flex-row bg-[#1C1C1E] rounded-2xl py-4 justify-around items-center border border-white/5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] text-[#8E8E93]">{t.yesShow}</span>
            <span className="text-lg font-bold text-[#bef408]">
              {user.yesShowCount}
            </span>
          </div>
          <div className="w-[1px] h-6 bg-[#2C2C2E]" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] text-[#8E8E93]">{t.noShow}</span>
            <span className="text-lg font-bold text-[#FF453A]">
              {user.noShowCount}
            </span>
          </div>
        </div>

        {/* 정보 카드 (가입일) */}
        <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8E8E93]">{t.joinDate}</span>
            <span className="text-sm text-white font-medium">
              {formatDateYear(user.createdAt, currentLang)}
            </span>
          </div>
        </div>
      </div>

      {/* 프로필 이미지 확대 보기 모달 */}
      {isModalVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90  animate-fadeIn"
          onClick={() => setIsModalVisible(false)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {user.profileImage && (
              <img
                src={user.profileImage}
                alt="Full Profile"
                className="max-w-[90%] max-h-[80%] object-contain rounded-xl"
              />
            )}
            <button
              onClick={() => setIsModalVisible(false)}
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition cursor-pointer"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
