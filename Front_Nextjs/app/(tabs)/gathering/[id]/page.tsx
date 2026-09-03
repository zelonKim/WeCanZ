"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IoArrowBack,
  IoChatbubblesOutline,
  IoCheckmarkCircleOutline,
  IoBanOutline,
  IoAlertCircleOutline,
  IoPencil,
  IoCalendarOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoPerson,
  IoHourglassOutline,
  IoCheckboxOutline,
  IoPersonRemoveOutline,
  IoClose,
} from "react-icons/io5";

// API 클라이언트 경로 (프로젝트 환경에 맞게 수정)
import { client } from "@/api/client";

// ================= TYPES =================
export interface UserProfile {
  id: string;
  nickname?: string;
  profileImage?: string;
  noShowCount?: number;
  yesShowCount?: number;
}

export interface Participant {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "BANNED" | "YES_SHOW";
  user?: UserProfile;
}

export interface GatheringDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  maxPeople: number;
  location: string;
  dateTime: string;
  status: "OPEN" | "FULL" | "IN_PROGRESS" | "CANCELED" | "COMPLETED";
  roomCode?: string;
  hostId: string;
  host?: UserProfile;
  participants: Participant[];
}

export interface EditGatheringDto {
  title?: string;
  description?: string;
  category?: string;
  maxPeople?: number;
  location?: string;
  dateTime?: string;
}

// ================= CONSTANTS & LABELS =================
const HOURS = Array.from({ length: 24 }, (_, i) => (i + 17) % 24);
const MINUTES = [0, 10, 20, 30, 40, 50];

const STATUS_LABEL: Record<string, string> = {
  OPEN: "모집중",
  FULL: "인원 마감",
  IN_PROGRESS: "진행중",
  CANCELED: "취소됨",
  COMPLETED: "종료됨",
};

const STATUS_COLOR_CLASS: Record<string, string> = {
  OPEN: "bg-blue-600 text-gray-100 border-blue-500/30",
  FULL: "bg-red-500 text-gray-900 border-red-500/30",
  IN_PROGRESS: "bg-red-500 text-gray-100 border-red-500/30",
  CANCELED: "bg-red-500 text-gray-900 border-red-500/30",
  COMPLETED: "bg-orange-500 text-gray-900 border-orange-500/30",
};

const CATEGORY_LABEL: Record<string, string> = {
  DRINK: "🍺 술벙",
  CLUB: "🎉 클럽벙",
  DRINK_CLUB: "🔥 술+클럽벙",
};

// ================= HELPER FUNCTIONS =================
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export default function GatheringDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const refreshDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    queryClient.invalidateQueries({ queryKey: ["my-gatherings"] });
  };

  // 상세 정보 조회
  const {
    data: gathering,
    isLoading,
    refetch: gatheringRefetch,
  } = useQuery<GatheringDetail>({
    queryKey: ["gathering", id],
    queryFn: async () => {
      const { data } = await client.get(`/gathering/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  // 내 정보 조회
  const { data: me } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  // 모임 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("DRINK");
  const [maxPeople, setMaxPeople] = useState<number | string>("");
  const [location, setLocation] = useState("");
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(0);

  // 팝업 메뉴 관리
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 유저 팝업 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuUserId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openEditModal = () => {
    if (!gathering) return;
    setTitle(gathering.title);
    setDescription(gathering.description);
    setLocation(gathering.location);
    setCategory(gathering.category);
    setMaxPeople(gathering.maxPeople);

    if (gathering.dateTime) {
      const gDate = new Date(gathering.dateTime);
      const year = gDate.getFullYear();
      const month = String(gDate.getMonth() + 1).padStart(2, "0");
      const day = String(gDate.getDate()).padStart(2, "0");
      setSelectedDateStr(`${year}-${month}-${day}`);
      setSelectedHour(gDate.getHours());
      setSelectedMinute(gDate.getMinutes());
    }
    setIsEditModalOpen(true);
  };

  const editMutation = useMutation({
    mutationFn: async (dto: EditGatheringDto) => {
      const { data } = await client.patch(`/gathering/${id}`, dto);
      return data;
    },
    onSuccess: async () => {
      alert("모임이 수정되었습니다!");
      await gatheringRefetch();
      refreshDetail();
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "모임 수정에 실패했습니다.";
      alert(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleEditGathering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title?.trim()) return alert("제목을 입력해주세요.");
    if (!description?.trim()) return alert("설명을 입력해주세요.");
    if (!location?.trim()) return alert("모임 장소를 입력해주세요.");
    if (!maxPeople || isNaN(Number(maxPeople)))
      return alert("올바른 정원 숫자를 입력해주세요.");

    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    editMutation.mutate({
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location.trim(),
      dateTime: finalDate.toISOString(),
    });
  };

  // 모임 제어/참여 관련 Mutations
  const applyMutation = useMutation({
    mutationFn: async () => client.post(`/participant/apply/${id}`),
    onSuccess: async () => {
      alert("참여 신청이 완료되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "신청 실패"),
  });

  const cancelApplyMutation = useMutation({
    mutationFn: async () => client.delete(`/participant/cancel/${id}`),
    onSuccess: async () => {
      alert("참여 신청이 취소되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "취소 실패"),
  });

  const approveMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/approve`),
    onSuccess: async () => {
      alert("참가자로 승인되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "승인 실패"),
  });

  const pendMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/pending`),
    onSuccess: async () => {
      alert("대기 상태로 변경되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) =>
      alert(err.response?.data?.message || "상태 변경 실패"),
  });

  const banMutation = useMutation({
    mutationFn: async (participantId: string) =>
      client.patch(`/participant/${participantId}/ban`),
    onSuccess: async () => {
      alert("강퇴 처리되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "강퇴 실패"),
  });

  const startMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/start`),
    onSuccess: async () => {
      alert("모임이 시작되었습니다! 🚀");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "시작 실패"),
  });

  const completeMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/complete`),
    onSuccess: async () => {
      alert("모임이 종료되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "종료 실패"),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => client.patch(`/gathering/${id}/cancel`),
    onSuccess: async () => {
      alert("모임이 취소되었습니다.");
      await gatheringRefetch();
      refreshDetail();
    },
    onError: (err: any) => alert(err.response?.data?.message || "취소 실패"),
  });

  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: string) =>
      client.post(`/friendship/request/${receiverId}`),
    onSuccess: () => alert("친구 요청을 보냈습니다."),
    onError: (err: any) =>
      alert(err.response?.data?.message || "친구 신청에 실패했습니다."),
  });

  const requestDmMutation = useMutation({
    mutationFn: async (targetUserId: string) =>
      client.post(`/direct-chat/request/${targetUserId}`),
    onSuccess: () => alert("DM 요청을 보냈습니다."),
    onError: (err: any) =>
      alert(err.response?.data?.message || "DM 요청에 실패했습니다."),
  });

  const blockUserMutation = useMutation({
    mutationFn: async (targetUserId: string) =>
      client.patch(`/friendship/block/${targetUserId}`),
    onSuccess: () => alert("해당 유저를 차단했습니다."),
    onError: (err: any) =>
      alert(err.response?.data?.message || "유저 차단에 실패했습니다."),
  });

  if (isLoading || !gathering) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );
  const approvedParticipants =
    gathering.participants?.filter(
      (p) => p.status === "APPROVED" || p.status === "YES_SHOW",
    ) || [];
  const pendingParticipants =
    gathering.participants?.filter((p) => p.status === "PENDING") || [];
  const currentCount = approvedParticipants.length;
  const myParticipant = gathering.participants?.find(
    (p) => p.userId === me?.id,
  );
  const isApprovedParticipant = myParticipant?.status === "APPROVED";
  const canAccessChat = isHost || isApprovedParticipant;

  const renderUserCard = (
    user?: UserProfile,
    roleTag?: string,
    participantId?: string,
    currentStatus?: "APPROVED" | "PENDING",
  ) => {
    const isMe = String(user?.id) === String(me?.id);
    const isMenuOpen = activeMenuUserId === user?.id;
    const isUserHost = String(user?.id) === String(gathering?.hostId);
    const displayRoleTag = roleTag || (isUserHost ? "👑 방장" : undefined);

    return (
      <div
        key={participantId || user?.id}
        className="relative flex items-center justify-between p-3 bg-neutral-800 rounded-xl mb-2"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* 프로필 이미지 */}
          <div className="relative">
            <button
              onClick={() => {
                if (user && !isMe) {
                  setActiveMenuUserId(isMenuOpen ? null : user.id);
                }
              }}
              className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-neutral-700 ${
                !isMe ? "cursor-pointer hover:opacity-80" : ""
              }`}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IoPerson className="text-gray-300 text-xl" />
              )}
            </button>

            {/* 인라인 팝업 메뉴 */}
            {isMenuOpen && user && (
              <div
                ref={menuRef}
                className="absolute left-12 top-0 z-50 w-36 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 text-xs text-white"
              >
                <button
                  onClick={() => {
                    setActiveMenuUserId(null);
                    router.push(`/profile/${user.id}`);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-700 transition"
                >
                  프로필 보기
                </button>
                <div className="border-t border-neutral-700 my-1" />
                <button
                  onClick={() => {
                    setActiveMenuUserId(null);
                    sendFriendRequestMutation.mutate(user.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-700 transition"
                >
                  친구 요청
                </button>
                <div className="border-t border-neutral-700 my-1" />
                <button
                  onClick={() => {
                    setActiveMenuUserId(null);
                    requestDmMutation.mutate(user.id);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-700 transition"
                >
                  DM 요청
                </button>
                <div className="border-t border-neutral-700 my-1" />
                <button
                  onClick={() => {
                    setActiveMenuUserId(null);
                    if (confirm(`${user.nickname}님을 차단하시겠습니까?`)) {
                      blockUserMutation.mutate(user.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-neutral-700 transition"
                >
                  차단
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white truncate">
                {user?.nickname}
              </span>
              {displayRoleTag && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {displayRoleTag}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              예스쇼 {user?.yesShowCount ?? 0}회 / 노쇼 {user?.noShowCount ?? 0}
              회
            </p>
          </div>
        </div>

        {/* 호스트 전용 컨트롤 버튼 */}
        {isHost &&
          !isUserHost &&
          participantId &&
          (gathering.status === "OPEN" || gathering.status === "FULL") && (
            <div className="flex items-center gap-1.5 ml-2">
              {currentStatus === "APPROVED" && (
                <button
                  onClick={() => pendMutation.mutate(participantId)}
                  className="p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-md text-amber-400 transition"
                  title="대기자로 내리기"
                >
                  <IoHourglassOutline size={16} />
                </button>
              )}

              {currentStatus === "PENDING" && (
                <button
                  onClick={() => approveMutation.mutate(participantId)}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition"
                  title="참가 승인"
                >
                  <IoCheckboxOutline size={16} />
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm("해당 참가자를 강퇴하시겠습니까?")) {
                    banMutation.mutate(participantId);
                  }
                }}
                className="p-1.5 bg-red-600 hover:bg-red-500 rounded-md text-white transition"
                title="강퇴"
              >
                <IoPersonRemoveOutline size={16} />
              </button>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 max-w-4xl mx-auto relative pb-20 shadow-2xl">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1 text-white hover:opacity-80"
        >
          <IoArrowBack size={22} />
        </button>
        <h1 className="font-semibold text-base">벙개 상세 정보</h1>
        <button
          onClick={() => {
            if (!canAccessChat) {
              return alert("승인된 참가자만 입장할 수 있습니다.");
            }
            router.push(`/gathering/${id}/chat`);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${"border-yellow-400/40 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"}`}
        >
          <IoChatbubblesOutline size={14} />
          <span>채팅방</span>
        </button>
      </header>

      {/* 본문 콘텐츠 */}
      <main className="p-4 space-y-4">
        {/* 상태 배너 */}
        {gathering.status === "COMPLETED" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-amber-400">
            <div className="flex items-center gap-1.5 font-medium text-sm">
              <IoCheckmarkCircleOutline size={18} />
              <span>종료된 모임입니다</span>
            </div>
          </div>
        )}

        {gathering.status === "CANCELED" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-center gap-1.5 text-red-400 text-sm font-medium">
            <IoAlertCircleOutline size={18} />
            <span>취소된 모임입니다</span>
          </div>
        )}

        {/* 상단 태그 및 수정 버튼 */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center ">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                STATUS_COLOR_CLASS[gathering.status] ||
                "bg-neutral-800 text-neutral-400"
              }`}
            >
              {STATUS_LABEL[gathering.status] || gathering.status}
            </span>
            <span className="text-xs font-bold text-yellow-500 px-2.5 py-1 rounded-lg">
              {CATEGORY_LABEL[gathering.category] || gathering.category}
            </span>
          </div>

          {isHost &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <button
                onClick={openEditModal}
                className="flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-700 transition"
              >
                <IoPencil size={12} />
                <span>수정</span>
              </button>
            )}
        </div>

        {/* 타이틀 및 상세 설명 */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            {gathering.title}
          </h2>
          <p className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
            {gathering.description}
          </p>
        </div>

        {/* 정보 섹션 */}
        <div className="bg-neutral-800/60 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-neutral-300">
            <IoCalendarOutline size={18} className="text-yellow-400 shrink-0" />
            <span>{formatDateTime(gathering.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-300">
            <IoLocationOutline size={18} className="text-red-400 shrink-0" />
            <span>{gathering.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-300">
            <IoPeopleOutline size={18} className="text-yellow-400 shrink-0" />
            <span>
              참여 인원:{" "}
              <strong className="text-yellow-400 font-semibold">
                {currentCount}
              </strong>{" "}
              / {gathering.maxPeople}명
            </span>
          </div>
          {gathering.roomCode && (
            <div className=" flex gap-2 items-center text-sm">
              <span className="text-neutral-400"> 룸 코드</span>
              <span className=" py-1 px-2 font-mono text-yellow-400 font-bold bg-neutral-800 rounded-lg border border-neutral-700/50">
                {gathering.roomCode}
              </span>
            </div>
          )}

          {/* 방장 전용 관리 영역 */}
          {isHost &&
            !(
              gathering.status === "COMPLETED" ||
              gathering.status === "CANCELED"
            ) && (
              <div className="mt-4 pt-3 border-t border-neutral-700/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <IoSettingsOutline size={14} />
                  <span>모임 관리</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(gathering.status === "OPEN" ||
                    gathering.status === "FULL") && (
                    <>
                      <button
                        onClick={() => {
                          if (confirm("정말로 모임을 시작하시겠습니까?"))
                            startMutation.mutate();
                        }}
                        className="py-2 px-3 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-semibold rounded-lg text-xs transition"
                      >
                        시작하기 🚀
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("정말로 모임을 취소하시겠습니까?"))
                            cancelMutation.mutate();
                        }}
                        className="py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition"
                      >
                        취소하기 🗑️
                      </button>
                    </>
                  )}
                  {gathering.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => {
                        if (confirm("정말로 모임을 종료하시겠습니까?"))
                          completeMutation.mutate();
                      }}
                      className="col-span-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-semibold rounded-lg text-xs transition"
                    >
                      종료하기 👋
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>

        <hr className="border-neutral-800 my-4" />

        {/* 참가자 목록 */}
        <section>
          <h3 className="text-sm font-semibold text-neutral-300 mb-2.5 flex items-center gap-1">
            <span>✅ 참가자</span>
          </h3>
          {approvedParticipants.length === 0 ? (
            <p className="text-xs text-neutral-500 py-2">
              참가 승인된 멤버가 없습니다.
            </p>
          ) : (
            approvedParticipants.map((p) =>
              renderUserCard(p.user, undefined, p.id, "APPROVED"),
            )
          )}
        </section>

        {/* 대기자 목록 */}
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-neutral-300 mb-2.5 flex items-center gap-1">
            <span>⏳ 대기자</span>
          </h3>
          {pendingParticipants.length === 0 ? (
            <p className="text-xs text-neutral-500 py-2">
              대기 중인 멤버가 없습니다.
            </p>
          ) : (
            pendingParticipants.map((p) =>
              renderUserCard(p.user, undefined, p.id, "PENDING"),
            )
          )}
        </section>

        {/* 액션 버튼 */}
        {!isHost &&
          (gathering.status === "OPEN" || gathering.status === "FULL") && (
            <div className="pt-4">
              {myParticipant ? (
                myParticipant.status !== "BANNED" && (
                  <button
                    onClick={() => {
                      if (confirm("정말 벙개 참여를 취소하시겠습니까?")) {
                        cancelApplyMutation.mutate();
                      }
                    }}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-sm border border-neutral-700 transition"
                  >
                    벙개 참여 취소하기
                  </button>
                )
              ) : (
                <button
                  onClick={() => applyMutation.mutate()}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-bold rounded-xl text-sm transition shadow-lg shadow-yellow-400/10"
                >
                  벙개 참여 신청하기 ⚡️
                </button>
              )}
            </div>
          )}
      </main>

      {/* 모임 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-700">
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <h3 className="font-bold text-white text-base">벙개 정보 수정</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <IoClose size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditGathering}
              className="p-4 space-y-3 max-h-[80vh] overflow-y-auto text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="DRINK">🍺 술벙</option>
                  <option value="CLUB">🎉 클럽벙</option>
                  <option value="DRINK_CLUB">🔥 술+클럽벙</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">정원 (명)</label>
                <input
                  type="number"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">장소</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">날짜</label>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">
                    시간 (시)
                  </label>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}시
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">분</label>
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-yellow-400"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}분
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded-lg font-medium hover:bg-neutral-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-4 py-2 bg-yellow-400 text-neutral-900 font-bold rounded-lg hover:bg-yellow-500 transition"
                >
                  {editMutation.isPending ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
