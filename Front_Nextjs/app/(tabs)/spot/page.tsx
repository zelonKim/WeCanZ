"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "@/api/client";
import { IoInformationCircleOutline, IoReloadOutline } from "react-icons/io5";

interface Store {
  id: string;
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  imageUrl?: string;
}

interface AdItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  store: Store;
}

const fetchActiveAds = async (): Promise<AdItem[]> => {
  const response = await client.get("/commercial/ads");
  return response.data;
};

const postAdClick = async (adId: string) => {
  await client.post(`/commercial/ads/${adId}/click`);
};

export default function CommercialPage() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: ads = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activeCommercialAds"],
    queryFn: fetchActiveAds,
  });

  const { mutate: recordClick } = useMutation({
    mutationFn: postAdClick,
    onError: (error) => {
      console.error("클릭 수 증가 실패:", error);
    },
  });

  const handleAdClick = (ad: AdItem) => {
    recordClick(ad.id);

    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-10 min-h-screen bg-[#121212]">
        <IoReloadOutline className="animate-spin text-[#FFD700]" size={36} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center py-10 min-h-screen bg-[#121212]">
        <p className="text-sm text-gray-400">
          광고를 불러오는 데 실패했습니다.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 bg-[#121212] text-white max-w-5xl w-full mx-auto">
      {/* 상단 커스텀 헤더 */}
      <header className="flex flex-row items-center justify-between py-3 mb-2">
        <h1 className="text-6xl font-bold text-xl">📍 인기 스팟</h1>

        {/* 우측 아이콘 버튼 */}
        <button
          className="p-1 bg-transparent border-none cursor-pointer flex items-center"
          onClick={() => setModalVisible(true)}
          aria-label="안내 정보"
        >
          <IoInformationCircleOutline size={26} className="text-[#FFD700]" />
        </button>
      </header>

      {/* 광고 카드 리스트 */}
      <div className="flex flex-col gap-4">
        {ads.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-10">
            <p className="text-sm text-gray-400">
              현재 진행 중인 제휴 광고가 없습니다.
            </p>
          </div>
        ) : (
          ads.map((item) => (
            <article
              key={item.id}
              className="grid md:grid-cols-2 rounded-xl overflow-hidden bg-[#1e1e1e] cursor-pointer shadow-md hover:scale-[1.01] transition-transform duration-200"
              onClick={() => handleAdClick(item)}
            >
              {(item.imageUrl || item.store.imageUrl) && (
                <img
                  src={item.imageUrl || item.store.imageUrl}
                  alt={item.title}
                  className="w-full h-[200px] object-cover object-center"
                />
              )}

              <div className="p-4">
                <h2 className="text-lg font-bold mb-1.5 mt-0">{item.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed max-h-[100px] overflow-hidden">
                  {item.content}
                </p>

                <div className="border-t border-[#333333] pt-2.5 flex flex-col gap-1 mt-3">
                  <p className="text-xs text-gray-300 mb-1 font-normal">
                    {item.store.name}
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    📍 {item.store.address}
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    ⏰ 영업시간: {item.store.openTime} ~ {item.store.closeTime}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* 광고 신청 방법 안내 모달 */}
      {modalVisible && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center p-5 z-[1000]"
          onClick={() => setModalVisible(false)}
        >
          <div
            className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-[340px] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-3 mt-0 text-white">
              📢 광고 및 제휴 신청 안내
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed text-center mb-5">
              운영하는 술집이나 클럽 등 제휴 광고를 <br /> 원하시는 사장님께서는
              아래 채널로 <br /> 문의해 주세요.
            </p>

            <div className="flex flex-col items-start w-full mb-4">
              <p className="text-xs text-white mb-1.5 font-medium">
                • 이메일: ksz18601@gmail.com
              </p>
              <p className="text-xs text-white mb-1.5 font-medium">
                • LINE 아이디: sj1860
              </p>
            </div>

            <button
              className="bg-[#333333] hover:bg-[#444444] text-white border-none py-2.5 rounded-lg w-full text-sm font-bold cursor-pointer transition-colors"
              onClick={() => setModalVisible(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
