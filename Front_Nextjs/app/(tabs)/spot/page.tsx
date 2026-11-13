"use client";

import { getActiveAds } from "@/api/spot/getActiveAds";
import { increaseClickCount } from "@/api/spot/postAdClick";
import { AdsInfoModal } from "@/components/AdsInfoModal";
import { useCommercialLanguage } from "@/hooks/Languages/useCommercialLanguage";
import { AdItem } from "@/types/spot/AdItem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Info, RefreshCw, Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function CommercialPage() {
  const t = useCommercialLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: ads = [],
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeCommercialAds"],
    queryFn: getActiveAds,
  });

  const { mutate: ClickCountMutation } = useMutation({
    mutationFn: increaseClickCount,
    onError: (error) => {
      console.log(error);
    },
  });

  const handleAdClick = (ad: AdItem) => {
    ClickCountMutation(ad.id);

    if (ad.linkUrl) {
      try {
        window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("링크 이동 중 오류 발생:", error);
        alert(t.linkError || "링크를 여는 중 오류가 발생했습니다.");
      }
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#bef408]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-[#121212] items-center justify-center p-6 text-center">
        <span className="text-zinc-400 text-base">{t.loadError}</span>
      </div>
    );
  }

  return (
    <div className=" flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#121212] shrink-0">
        <h1 className="text-2xl font-extrabold italic tracking-tight text-[#bef408]">
          {t.headerTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalVisible(true)}
            className="p-2 rounded-xl hover:bg-white/5 transition cursor-pointer text-[#bef408]"
            title="정보"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (스크롤) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 max-w-[980px] mx-auto w-full">
        {ads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-center">
            <span className="text-zinc-500 text-sm">{t.emptyText}</span>
          </div>
        ) : (
          ads.map((item: AdItem) => (
            <div
              key={item.id}
              onClick={() => handleAdClick(item)}
              className="grid grid-cols-1 sm:grid-cols-2 bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-white/5 hover:bg-zinc-800/60 transition cursor-pointer "
            >
              {/* 광고 이미지: max-h와 w-full을 주어 이미지가 화면을 너무 덮지 않도록 조절 */}
              <div className="w-full h-72 sm:h-80 relative bg-zinc-950 overflow-hidden">
                <img
                  src={item.imageUrl || item.store.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 광고 내용 */}
              <div className="p-4 sm:p-5 flex flex-col gap-3">
                {/* 광고 뱃지 */}
                <div className="self-start bg-zinc-800 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                  {t.adBadge}
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>

                {/* 매장 정보 행 */}
                <div className="border-t border-white/10 pt-4 flex flex-col gap-1.5 mt-1">
                  <span className="text-xs font-medium text-zinc-300">
                    {item.store.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    📍 {item.store.address}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {t.hoursLabel} {item.store.openTime} ~{" "}
                    {item.store.closeTime}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 정보 모달 */}
      <AdsInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t.modalTitle}
        description={t.modalDescription}
        emailLabel={t.modalEmailLabel}
        closeText={t.modalClose}
      />
    </div>
  );
}
