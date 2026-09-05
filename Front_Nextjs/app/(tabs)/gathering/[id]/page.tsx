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

  /////////////////////////////////////////////////////

  // 1. 노쇼 모달 열림 상태 관리
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);

  // 2. 노쇼 처리 Mutation
  const noShowMutation = useMutation({
    mutationFn: async (participantId: string) => {
      return await client.patch(`/participant/${participantId}/no-show`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "노쇼 처리 실패");
    },
  });

  // 3. 출석 체크 완료
  const handleCompleteCheck = async () => {
    const restParticipants = (gathering?.participants || []).filter(
      (p: any) => p.status === "APPROVED",
    );

    try {
      if (restParticipants.length > 0) {
        await Promise.all(
          restParticipants.map((p: any) =>
            client.patch(`/participant/${p.id}/yes-show`),
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["gathering", id] });
      }

      setIsNoShowModalOpen(false);
      alert("참가자 출석 체크가 완료되었습니다.");
    } catch (error) {
      alert("출석 체크 처리 중 오류가 발생했습니다.");
    }
  };

  /////////////////////////////////////////////////////

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
      <div className="flex-1 flex justify-center items-start py-55">
        <div className="animate-spin text-4xl">⚡️</div>
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
              <span className="font-semibold text-base text-white truncate">
                {user?.nickname}
              </span>
              {displayRoleTag && (
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold">
                  {displayRoleTag}
                </span>
              )}
            </div>
            <p className="text-[13px] text-neutral-400 mt-0.5">
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
    <div className="bg-[#121212]  max-w-4xl mx-auto ">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="cursor-pointer p-1 text-white hover:opacity-80"
        >
          <IoArrowBack size={22} />
        </button>
        <h1 className="font-semibold text-lg">벙개 상세 정보</h1>
        <button
          onClick={() => {
            if (!canAccessChat) {
              return alert("승인된 참가자만 입장할 수 있습니다.");
            }
            router.push(`/gathering/${id}/chat`);
          }}
          className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${"border-yellow-400/40 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"}`}
        >
          <IoChatbubblesOutline size={14} />
          <span>채팅방</span>
        </button>
      </header>

      {/* 본문 콘텐츠 */}
      <main className="p-6 pb-12 space-y-4 bg-[#121212]">
        {/* 상태 배너 */}

        {gathering.status === "COMPLETED" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-row justify-between items-center  gap-2 text-amber-400 ">
            <div className="flex items-center gap-1.5 font-medium text-sm">
              <IoCheckmarkCircleOutline size={18} />
              <span>종료된 모임입니다</span>
            </div>

            {isHost &&
              (gathering?.participants || []).some(
                (p: any) => p.status === "APPROVED",
              ) && (
                <button
                  type="button"
                  onClick={() => setIsNoShowModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600/90 transition cursor-pointer"
                >
                  <IoBanOutline size={18} className="text-white" />
                  <span>노쇼 체크하기</span>
                </button>
              )}
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
            <span className="text-sm font-bold text-yellow-400 px-2.5 py-1 rounded-lg">
              {CATEGORY_LABEL[gathering.category] || gathering.category}
            </span>
          </div>

          {isHost &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <button
                onClick={openEditModal}
                className="cursor-pointer flex items-center gap-1 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-700 transition"
              >
                <IoPencil size={12} />
                <span>수정</span>
              </button>
            )}
        </div>

        {/* 타이틀 및 상세 설명 */}
        <div>
          <h2 className="text-[22px] font-bold text-white mb-2">
            {gathering.title}
          </h2>
          <p className="text-lg text-neutral-300 whitespace-pre-line leading-relaxed">
            {gathering.description}
          </p>
        </div>

        {/* 정보 섹션 */}
        <div className="bg-neutral-800/60 border border-neutral-800 rounded-xl p-4 space-y-3 my-6 ">
          <div className="flex items-center gap-2.5 text-[15px] text-neutral-200">
            <IoCalendarOutline size={18} className="text-yellow-400 shrink-0" />
            <span>{formatDateTime(gathering.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[15px] text-neutral-200">
            <IoLocationOutline size={18} className="text-red-400 shrink-0" />
            <span>{gathering.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[15px] text-neutral-200">
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
            <div className=" flex gap-2 items-center text-[15px] mt-4">
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
                <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-400">
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
                        className="cursor-pointer py-2 px-3 bg-yellow-400/90 hover:bg-yellow-500/90 text-neutral-900 font-semibold rounded-lg text-sm transition"
                      >
                        시작하기 🚀
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("정말로 모임을 취소하시겠습니까?"))
                            cancelMutation.mutate();
                        }}
                        className="cursor-pointer py-2 px-3 bg-red-600/90 hover:bg-red-700/90 text-white font-semibold rounded-lg text-sm transition"
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

        <hr className="border-neutral-800 mt-8" />

        {/* 참가자 목록 */}
        <section>
          <h3 className=" text-base font-semibold text-neutral-200 mt-6 mb-2.5 flex items-center gap-1">
            <span>✅ 참가자</span>
          </h3>
          {approvedParticipants.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">
              참가 승인된 멤버가 없습니다.
            </p>
          ) : (
            approvedParticipants.map((p) =>
              renderUserCard(p.user, undefined, p.id, "APPROVED"),
            )
          )}
        </section>

        {/* 대기자 목록 */}
        <section className="mt-8">
          <h3 className="text-base font-semibold text-neutral-200 mb-2 flex items-center gap-1">
            <span>⏳ 대기자</span>
          </h3>
          {pendingParticipants.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">
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
            <div className="pt-8">
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
                    참여 취소하기
                  </button>
                )
              ) : (
                <button
                  onClick={() => applyMutation.mutate()}
                  className="w-full py-3 mb-6 bg-yellow-400/90 hover:bg-yellow-500/90 text-neutral-900 font-bold rounded-xl text-base transition shadow-lg shadow-yellow-400/10"
                >
                  참여 신청하기 ⚡️
                </button>
              )}
            </div>
          )}
      </main>

      {/* 모임 수정 모달 */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-2xl border border-neutral-800 bg-[#191919] p-6 text-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white">벙개 정보 수정</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* 모달 바디 (스크롤 영역) */}
            <form
              onSubmit={handleEditGathering}
              className="flex flex-col flex-1 overflow-y-auto space-y-5 py-4 px-1 scrollbar-none"
            >
              {/* 카테고리 선택 */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-400">
                  카테고리
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "🍺 술벙", value: "DRINK" },
                    { label: "🎉 클럽벙", value: "CLUB" },
                    { label: "🔥 술+클럽벙", value: "DRINK_CLUB" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`py-3 rounded-xl text-sm font-bold transition ${
                        category === item.value
                          ? "bg-amber-400 text-neutral-900 shadow-md"
                          : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                  제목
                </label>
                <input
                  type="text"
                  placeholder="예) 종로 같이 술마실 분!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                  설명
                </label>
                <textarea
                  placeholder="예) 끼, 주사 없는 2030만"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full resize-none rounded-xl bg-neutral-800/60 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* 장소 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                  장소
                </label>
                <input
                  type="text"
                  placeholder="예) 종로3가역 6번 출구"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* 날짜 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                  날짜
                </label>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition [color-scheme:dark]"
                />
              </div>

              {/* 시간 선택 (시 / 분 칩 스크롤) */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-400">
                  시간
                </label>

                {/* 시간 미리보기 배너 */}
                <div className="mb-3 rounded-xl border border-amber-400/30 bg-neutral-900 py-2.5 text-center">
                  <span className="text-xl font-bold tracking-widest text-amber-400">
                    {String(selectedHour).padStart(2, "0")} :{" "}
                    {String(selectedMinute).padStart(2, "0")}
                  </span>
                </div>

                <span className="mb-1 block text-[11px] text-neutral-500">
                  시
                </span>
                <div className="mb-3 flex gap-2 overflow-x-auto py-1 scrollbar-none">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHour(h)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedHour === h
                          ? "bg-amber-400 text-neutral-900 font-bold"
                          : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {String(h).padStart(2, "0")}시
                    </button>
                  ))}
                </div>

                <span className="mb-1 block text-[11px] text-neutral-500">
                  분
                </span>
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMinute(m)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedMinute === m
                          ? "bg-amber-400 text-neutral-900 font-bold"
                          : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {String(m).padStart(2, "0")}분
                    </button>
                  ))}
                </div>
              </div>

              {/* 정원 */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-400">
                  정원 (명)
                </label>
                <input
                  type="number"
                  value={maxPeople}
                  onChange={(e) => setMaxPeople(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* 하단 수정완료 버튼 */}
              <button
                type="submit"
                disabled={editMutation.isPending}
                className="my-4 flex w-full items-center justify-center rounded-xl bg-amber-400 py-3.5 text-base font-bold text-neutral-900 transition hover:bg-amber-500 disabled:opacity-50 shadow-lg shadow-amber-400/10"
              >
                {editMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-900" />
                ) : (
                  "수정하기"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 노쇼 체크하기 모달 */}
      {isNoShowModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsNoShowModalOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-neutral-800 bg-[#191919] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">
                참가자 노쇼 체크
              </h3>
              <button
                type="button"
                onClick={() => setIsNoShowModalOpen(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* 참가자 리스트 (FlatList -> map 변환) */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 py-2 scrollbar-none">
              {(gathering?.participants || [])
                .filter(
                  (item: any) =>
                    item.userId !== me?.id &&
                    (item.status === "APPROVED" ||
                      item.status === "YES_SHOW" ||
                      item.status === "NO_SHOW"),
                )
                .map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    {/* 유저 정보 및 뱃지 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-white">
                        {item.user?.nickname || "참가자"}
                      </span>
                      {item.status === "NO_SHOW" && (
                        <span className="rounded bg-red-400/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                          노쇼 처리됨
                        </span>
                      )}
                      {item.status === "YES_SHOW" && (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          예스쇼 처리됨
                        </span>
                      )}
                    </div>

                    {/* 노쇼 지정 버튼 (방장 자신 제외 & 이미 노쇼가 아닌 유저만) */}
                    {item.userId !== me?.id && item.status !== "NO_SHOW" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `${item.user?.nickname || "참가자"}님을 노쇼 처리하시겠습니까?`,
                            )
                          ) {
                            noShowMutation.mutate(item.id);
                          }
                        }}
                        className=" cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-[13px] font-semibold text-gray-100 hover:bg-red-600/90 transition"
                      >
                        노쇼 지정
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* 모달 푸터 (체크 완료 버튼) */}
            <div className="border-t border-neutral-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`참가자 노쇼 체크를 완료하시겠습니까?`)) {
                    handleCompleteCheck();
                  }
                }}
                className="cursor-pointer w-full rounded-xl bg-amber-400 py-3 text-base font-bold text-neutral-900 hover:bg-amber-500/90 transition shadow-lg shadow-amber-400/10"
              >
                체크 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
