"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "@/api/client";
import { IoInformationCircleOutline } from "react-icons/io5";
import { Location } from "react-ionicons";

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
      <div className="flex-1 flex justify-center items-start py-62">
        <div className="animate-spin text-4xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center py-10 min-h-screen ">
        <p className="text-sm text-gray-400">
          광고를 불러오는 데 실패했습니다.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4  text-white max-w-5xl w-full mx-auto pb-10">
      {/* 상단 커스텀 헤더 */}
      <header className="flex flex-row items-center justify-between py-3 my-1">
        <h1 className="text-[28px] font-bold italic text-[#bef408]">Z-Spot</h1>

        {/* 우측 아이콘 버튼 */}
        <button
          className=" bg-transparent border-none cursor-pointer p-2 hover:bg-zinc-800 rounded-2xl transition flex items-center"
          onClick={() => setModalVisible(true)}
          aria-label="안내 정보"
        >
          <IoInformationCircleOutline size={26} className="text-[#bef408]" />
        </button>
      </header>

      <div className="h-[1px] bg-zinc-800 mb-3" />
      {/* 광고 카드 리스트 */}

      <div className="flex flex-col gap-8">
        {ads.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-10">
            <p className="text-base text-gray-400">
              현재 진행 중인 제휴 광고가 없습니다.
            </p>
          </div>
        ) : (
          ads.map((item) => (
            <article
              key={item.id}
              className="grid md:grid-cols-2  rounded-xl overflow-hidden bg-[#1e1e1e] cursor-pointer shadow-md hover:scale-[1.01] transition-transform duration-200"
              onClick={() => handleAdClick(item)}
            >
              {(item.imageUrl || item.store.imageUrl) && (
                <img
                  src={item.imageUrl || item.store.imageUrl}
                  alt={item.title}
                  className="w-full aspect-square object-cover object-center"
                />
              )}

              <div className="p-4">
                <div className="w-9 rounded bg-[#2C2C2E] px-2 text-center  mb-1">
                  <span className="text-[10px] font-bold text-[#8E8E93]">
                    광고
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-1.5 mt-0">{item.title}</h2>
                <p className="text-base text-gray-400 leading-relaxed max-h-[100px] overflow-hidden">
                  {item.content}
                </p>

                <div className="border-t border-[#333333] pt-2.5 flex flex-col gap-1 mt-3">
                  <p className="text-[15px] text-gray-300 mb-1 font-medium">
                    {item.store.name}
                  </p>
                  <p className="text-sm text-gray-400 m-0">
                    📍 {item.store.address}
                  </p>
                  <p className="text-sm text-gray-400 m-0">
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
            <h3 className="text-xl font-bold mb-3 mt-0 text-white">
              📢 광고 및 제휴 신청 안내
            </h3>
            <p className="text-base text-gray-300 leading-relaxed text-center mb-6">
              Z-Spot에 제휴 광고를 원하시는 분께서는 <br /> 아래 채널로 문의해
              주세요.
            </p>

            <div className="flex flex-col items-start w-full mb-4 ml-10">
              <p className="text-base text-gray-100 mb-1.5 font-medium">
                • 이메일: ksz18601@gmail.com
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
