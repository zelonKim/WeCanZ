"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import {
  StorefrontOutline,
  CalendarOutline,
  LocationOutline,
  PersonOutline,
  AddOutline,
  CloseOutline,
} from "react-ionicons";
import { getAccessToken } from "@/api/token";

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
  dateTime: string;
  status: string;
  createdAt: string;
  hostId: string;
  host: {
    profileImage: string;
  };
}

const CATEGORIES = [
  { label: "전체", value: "ALL" },
  { label: "술벙", value: GatheringCategory.DRINK },
  { label: "클럽벙", value: GatheringCategory.CLUB },
  { label: "술+클럽벙", value: GatheringCategory.DRINK_CLUB },
];

const fetchGatherings = async (): Promise<Gathering[]> => {
  const { data } = await client.get("/gathering");
  return data;
};

const createGathering = async (dto: any) => {
  const { data } = await client.post("/gathering", dto);
  return data;
};

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedTime, setSelectedTime] = useState("20:00");

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // 모임 목록 조회
  const { data: gatherings = [], isLoading } = useQuery({
    queryKey: ["gatherings"],
    queryFn: fetchGatherings,
  });

  // 모임 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: createGathering,
    onSuccess: () => {
      alert("모임이 생성되었습니다! 🎉");
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      closeAndResetModal();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "모임 생성에 실패했습니다.";
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const filteredGatherings = gatherings.filter((item) => {
    const isOpenOrFull = item.status === "OPEN" || item.status === "FULL";
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    return isOpenOrFull && matchesCategory;
  });

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setCategory(GatheringCategory.DRINK);
    setMaxPeople("8");
    setLocation("");
  };

  const handleCreateGathering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!description.trim()) return alert("설명을 입력해주세요.");
    if (!location.trim()) return alert("모임 장소를 입력해주세요.");
    if (!maxPeople || isNaN(Number(maxPeople))) {
      return alert("올바른 정원 숫자를 입력해주세요.");
    }

    const dateTime = new Date(
      `${selectedDate}T${selectedTime}:00`,
    ).toISOString();

    createMutation.mutate({
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location.trim(),
      dateTime,
    });
  };

  const getCategoryLabel = (cat: GatheringCategory) => {
    switch (cat) {
      case GatheringCategory.DRINK:
        return "🍺 술벙";
      case GatheringCategory.CLUB:
        return "🪩 클럽벙";
      case GatheringCategory.DRINK_CLUB:
        return "🔥 술+클럽벙";
      default:
        return cat;
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col  min-h-screen bg-black text-white pb-20">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold">👋 벙개의 광장</h1>
        <button
          onClick={() => router.push("/commercial")}
          className="flex items-center justify-center bg-[#FFE600] w-9 h-9 rounded-full transition hover:opacity-90"
        >
          <StorefrontOutline color="#000000" height="20px" width="20px" />
        </button>
      </div>

      {/* 카테고리 필터 바 */}
      <div className="px-4 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat.value
                  ? "bg-[#FFE600] text-black font-bold"
                  : "bg-[#2C2C2E] text-[#8E8E93]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 모임 리스트 영역 */}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredGatherings.length === 0 ? (
        <div className="text-center py-24 text-[#8E8E93] text-sm leading-relaxed">
          아직 등록된 벙개가 없습니다. <br />첫 벙개를 열어보세요!
        </div>
      ) : (
        <div className="px-4  grid md:grid-cols-2 gap-4">
          {filteredGatherings.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/gathering/${item.id}`)}
              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 cursor-pointer hover:border-[#FFE600] transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.status === "OPEN"
                        ? "bg-green-500 text-black"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.status === "OPEN" ? "모집중" : "인원 마감"}
                  </span>
                  <span className="text-[13px] font-bold text-[#FFE600]">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <span className="text-[13px] text-[#8E8E93]">
                  정원 {item.maxPeople}명
                </span>
              </div>

              <h2 className="text-base font-bold mb-1 text-white">
                {item.title}
              </h2>
              <p className="text-sm text-[#8E8E93] line-clamp-2 mb-3">
                {item.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[13px] text-white">
                    <CalendarOutline
                      color="#FFE600"
                      height="14px"
                      width="14px"
                    />
                    <span>{formatDateTime(item.dateTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-white">
                    <LocationOutline
                      color="#EF4444"
                      height="14px"
                      width="14px"
                    />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#2C2C2E]">
                  {item.host?.profileImage ? (
                    <img
                      src={item.host.profileImage}
                      alt="Host"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PersonOutline color="#FFFFFF" height="20px" width="20px" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB (플로팅 생성 버튼) */}

      <div className="max-w-5xl w-full mx-auto relative px-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition z-40"
          style={{
            right: "max(1.5rem, calc((100vw - 64rem) / 2 + 1.5rem))",
          }}
        >
          <AddOutline color="#FFFFFF" height="28px" width="28px" />
        </button>
      </div>
      {/* 모임 생성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/75 flex items-end sm:items-center justify-center">
          {/* max-h-[90vh]와 flex flex-col을 주어 전체 모달이 화면을 넘지 않게 고정합니다 */}
          <div className="mb-16 w-full max-w-lg bg-[#1C1C1E] border-t sm:border border-[#2C2C2E] rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold">새 벙개 만들기</h2>
              <button onClick={closeAndResetModal}>
                <CloseOutline color="#8E8E93" height="24px" width="24px" />
              </button>
            </div>

            {/* overflow-y-auto를 주어 내용이 길어지면 이 영역 안에서만 스크롤되도록 만듭니다 */}
            <form
              onSubmit={handleCreateGathering}
              className="space-y-4 pr-1 overflow-y-auto flex-grow"
            >
              <div>
                <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                  카테고리
                </label>
                <div className="flex gap-2">
                  {[
                    { label: "술벙", value: GatheringCategory.DRINK },
                    { label: "클럽벙", value: GatheringCategory.CLUB },
                    { label: "술+클럽벙", value: GatheringCategory.DRINK_CLUB },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setCategory(item.value)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${
                        category === item.value
                          ? "bg-[#FFE600] text-black"
                          : "bg-[#2C2C2E] text-[#8E8E93]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                  모임 제목
                </label>
                <input
                  type="text"
                  placeholder="예) 종로 같이 술마실 분!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                  상세 설명
                </label>
                <textarea
                  placeholder="예) 끼, 주사 없는 2030만"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                  장소
                </label>
                <input
                  type="text"
                  placeholder="예) 종로3가역 6번 출구"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                    모임 날짜
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none text-white focus:ring-2 focus:ring-[#FFE600]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                    모임 시간
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none text-white focus:ring-2 focus:ring-[#FFE600]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8E8E93] block mb-1">
                  최대 인원 (명)
                </label>
                <input
                  type="number"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FFE600]"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-red-500 py-3 rounded-xl font-bold text-white mt-4 mb-2 hover:opacity-90 transition disabled:opacity-50"
              >
                {createMutation.isPending ? "만드는 중..." : "방 만들기"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
