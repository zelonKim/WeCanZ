"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { client } from "@/api/client";
import {
  IoLogInOutline,
  IoAdd,
  IoClose,
  IoCalendarOutline,
  IoLocationOutline,
  IoPerson,
  IoRefreshOutline,
  IoQrCodeOutline,
} from "react-icons/io5";

export enum GatheringCategory {
  DRINK = "DRINK",
  CLUB = "CLUB",
  DRINK_CLUB = "DRINK_CLUB",
}

export interface Gathering {
  id: string;
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  status: string;
  createdAt: string;
  hostId: string;
  host: {
    profileImage: string;
  };
}

export interface CreateGatheringDto {
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  dateTime: string;
}

const CATEGORIES = [
  { label: "전체", value: "ALL" },
  { label: "술벙", value: GatheringCategory.DRINK },
  { label: "클럽벙", value: GatheringCategory.CLUB },
  { label: "술+클럽벙", value: GatheringCategory.DRINK_CLUB },
];

const HOURS = [
  17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16,
];
const MINUTES = [0, 10, 20, 30, 40, 50];

const fetchGatherings = async (): Promise<Gathering[]> => {
  const { data } = await client.get("/gathering");
  return data;
};

const createGathering = async (dto: CreateGatheringDto) => {
  const { data } = await client.post("/gathering", dto);
  return data;
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hours}:${minutes}`;
};

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // 생성 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 폼 입력 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.DRINK,
  );
  const [maxPeople, setMaxPeople] = useState("8");
  const [location, setLocation] = useState("");

  // 날짜/시간 선택 상태
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours() + 1,
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  // 룸코드 모달 상태
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  // 내 정보 확인 (약관 동의 미 진행 시 로그인 페이지로 이동)
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  useEffect(() => {
    if (me) {
      if (!me.termsAgreedAt || !me.privacyAgreedAt) {
        router.replace("/login");
      }
    }
  }, [me, router]);

  // 모임 목록 Query
  const {
    data: gatherings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["gatherings"],
    queryFn: fetchGatherings,
  });

  // 모임 생성 Mutation
  const createMutation = useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      alert("벙개가 생성되었습니다! 🎉");
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "벙개 생성에 실패했습니다.";
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // 초대 코드로 모임 검색 후 이동
  const handleEnterRoom = async () => {
    const cleanCode = inviteCode.trim().toLowerCase();

    if (!cleanCode || cleanCode.length !== 4) {
      alert("4자리 룸코드를 올바르게 입력해 주세요.");
      return;
    }

    try {
      setIsInviteLoading(true);
      const response = await client.get(`/gathering/search/${cleanCode}`);
      const gatheringId = response.data.id;

      setInviteCode("");
      setIsInviteModalOpen(false);
      router.push(`/gathering/${gatheringId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "벙개를 찾을 수 없습니다.";
      alert(message);
    } finally {
      setIsInviteLoading(false);
    }
  };

  const filteredGatherings = gatherings.filter((item) => {
    const isNotFinished =
      item.status !== "COMPLETED" && item.status !== "CANCELED";
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return isNotFinished && matchesCategory;
  });

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setCategory(GatheringCategory.DRINK);
    setMaxPeople("8");
    setLocation("");
    setSelectedDateStr(new Date().toISOString().split("T")[0]);
    setSelectedHour(new Date().getHours());
    setSelectedMinute(0);
  };

  const handleCreateGathering = () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!description.trim()) return alert("설명을 입력해주세요.");
    if (!location.trim()) return alert("모임 장소를 입력해주세요.");
    if (!maxPeople || isNaN(Number(maxPeople))) {
      return alert("올바른 정원 숫자를 입력해주세요.");
    }

    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    const dto: CreateGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location.trim(),
      dateTime: finalDate.toISOString(),
    };

    createMutation.mutate(dto);
  };

  const getCategoryLabel = (cat: GatheringCategory) => {
    switch (cat) {
      case GatheringCategory.DRINK:
        return "🍺 술벙";
      case GatheringCategory.CLUB:
        return "🎉 클럽벙";
      case GatheringCategory.DRINK_CLUB:
        return "🔥 술+클럽벙";
      default:
        return cat;
    }
  };

  const STATUS_CONFIG: Record<
    string,
    { label: string; badgeClass: string; textClass: string }
  > = {
    OPEN: {
      label: "모집 중",
      badgeClass: "bg-blue-600",
      textClass: "text-white",
    },
    FULL: {
      label: "인원 마감",
      badgeClass: "bg-red-500",
      textClass: "text-white",
    },
    IN_PROGRESS: {
      label: "진행 중",
      badgeClass: "bg-red-500",
      textClass: "text-white",
    },
  };

  return (
    <main className=" min-h-screen bg-[#121212] text-white max-w-5xl w-full mx-auto relative px-4 pb-24">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between py-3 mb-2">
        <h1 className="text-xl font-bold">⚡️ 벙개의 광장</h1>
        <button
          className="p-1.5 rounded-full hover:bg-[#2C2C2E] transition-colors"
          onClick={() => {
            setIsInviteModalOpen(true);
            setInviteCode("");
          }}
          aria-label="룸 코드 입장"
        >
          <IoQrCodeOutline size={22} className="text-[#FFD700]" />
        </button>
      </header>

      {/* 카테고리 필터 Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? "bg-[#FFD700] text-black"
                : "bg-[#2C2C2E] text-gray-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 모임 리스트 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <IoRefreshOutline className="animate-spin text-[#FFD700]" size={36} />
        </div>
      ) : filteredGatherings.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-sm leading-relaxed">
          아직 등록된 벙개가 없습니다. <br /> 첫 벙개를 열어보세요!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 flex flex-col gap-4">
          {filteredGatherings.map((item) => (
            <article
              key={item.id}
              onClick={() => router.push(`/gathering/${item.id}`)}
              className="bg-[#1e1e1e] border border-[#333] rounded-2xl p-4 cursor-pointer hover:border-yellow-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      STATUS_CONFIG[item.status]?.badgeClass || "bg-gray-700"
                    } ${STATUS_CONFIG[item.status]?.textClass || "text-white"}`}
                  >
                    {STATUS_CONFIG[item.status]?.label || item.status}
                  </span>
                  <span className="text-xs font-bold text-[#FFD700]">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  정원 {item.maxPeople}명
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-1">
                {item.title}
              </h2>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-end justify-between pt-1">
                <div className="flex flex-col gap-1 text-xs text-white">
                  <div className="flex items-center gap-1.5">
                    <IoCalendarOutline className="text-[#FFD700]" size={14} />
                    <span>{formatDateTime(item.dateTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IoLocationOutline className="text-red-500" size={14} />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  {item.host?.profileImage ? (
                    <img
                      src={item.host.profileImage}
                      alt="호스트 프로필"
                      className="w-10 h-10 rounded-full object-cover border border-[#333]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2C2C2E] border border-[#333] flex items-center justify-center text-white">
                      <IoPerson size={20} />
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* FAB (생성 플로팅 버튼) */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto w-14 h-14 bg-yellow-300 rounded-full flex items-center justify-center text-gray-800 shadow-xs hover:bg-yellow-400 shadow-yellow-100 transition-transform active:scale-95"
            aria-label="새 벙개 만들기"
          >
            <IoAdd size={32} />
          </button>
        </div>
      </div>

      {/* 새 벙개 만들기 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex justify-center items-end z-100 "
          onClick={closeAndResetModal}
        >
          <div
            className="bg-[#1e1e1e] border border-[#333] rounded-3xl p-5 w-md sm:w-xl max-h-[90vh] flex flex-col mb-12 "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#333] mb-4">
              <h3 className="text-lg font-bold">새 벙개 만들기</h3>
              <button
                onClick={closeAndResetModal}
                className="text-gray-400 hover:text-white"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {/* 카테고리 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  카테고리
                </label>
                <div className="flex gap-2">
                  {[
                    { label: "술벙", value: GatheringCategory.DRINK },
                    { label: "클럽벙", value: GatheringCategory.CLUB },
                    {
                      label: "술+클럽벙",
                      value: GatheringCategory.DRINK_CLUB,
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        category === item.value
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#2C2C2E] text-gray-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  모임 제목
                </label>
                <input
                  type="text"
                  placeholder="예) 종로 같이 술마실 분!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  상세 설명
                </label>
                <textarea
                  placeholder="예) 끼, 주사 없는 2030만"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none"
                />
              </div>

              {/* 장소 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  장소
                </label>
                <input
                  type="text"
                  placeholder="예) 종로3가역 6번 출구"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>

              {/* 모임 날짜 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  모임 날짜 선택
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FFD700] [color-scheme:dark]"
                />
              </div>

              {/* 모임 시간 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  모임 시간 선택
                </label>
                <div className="bg-[#1C1C1E] border border-[#FFD700] rounded-xl py-2.5 text-center mb-3">
                  <span className="text-2xl font-bold text-[#FFD700] tracking-widest">
                    {String(selectedHour).padStart(2, "0")} :{" "}
                    {String(selectedMinute).padStart(2, "0")}
                  </span>
                </div>

                <span className="block text-[11px] text-gray-400 mb-1">시</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour(h)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedHour === h
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#2C2C2E] text-white"
                      }`}
                    >
                      {String(h).padStart(2, "0")}시
                    </button>
                  ))}
                </div>

                <span className="block text-[11px] text-gray-400 mb-1">분</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedMinute === m
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#2C2C2E] text-white"
                      }`}
                    >
                      {String(m).padStart(2, "0")}분
                    </button>
                  ))}
                </div>
              </div>

              {/* 최대 인원 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  최대 인원 (명)
                </label>
                <input
                  type="number"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                />
              </div>
            </div>

            <button
              onClick={handleCreateGathering}
              disabled={createMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white text-sm mt-4 transition-colors flex justify-center items-center"
            >
              {createMutation.isPending ? (
                <IoRefreshOutline className="animate-spin" size={20} />
              ) : (
                "방 만들기"
              )}
            </button>
          </div>
        </div>
      )}

      {/* 초대 코드 모달 */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex justify-center items-center p-5 z-50"
          onClick={() => {
            setInviteCode("");
            setIsInviteModalOpen(false);
          }}
        >
          <div
            className="bg-[#1C1C1E] rounded-2xl p-5 w-full max-w-[320px] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">
              🔡 룸 코드 입장
            </h3>
            <p className="text-xs text-gray-400 mb-5 text-center">
              방의 4자리 룸 코드를 입력해 주세요.
            </p>

            <input
              type="text"
              maxLength={4}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
              placeholder="____"
              className="w-full h-12 bg-[#2C2C2E] rounded-lg text-[#FFE600] text-xl font-bold text-center tracking-[6px] uppercase mb-5 focus:outline-none focus:ring-1 focus:ring-[#FFE600]"
            />

            <div className="flex gap-2.5 w-full">
              <button
                type="button"
                className="flex-1 h-11 bg-[#2C2C2E] text-gray-400 font-semibold rounded-lg text-sm"
                onClick={() => {
                  setInviteCode("");
                  setIsInviteModalOpen(false);
                }}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 h-11 bg-[#FFE600] text-black font-bold rounded-lg text-sm disabled:opacity-50"
                onClick={handleEnterRoom}
                disabled={isInviteLoading}
              >
                {isInviteLoading ? "확인 중..." : "입장하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
