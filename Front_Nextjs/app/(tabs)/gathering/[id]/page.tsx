"use client";

import { client } from "@/api/client";
import { GatheringModal } from "@/components/GatheringModal";
import { GatheringUserCard } from "@/components/GatheringUserCard";
import { NoShowModal } from "@/components/NoShowModal";
import { ReportModal } from "@/components/ReportModal";
import { STATUS_COLOR } from "@/constants/STATUS_COLOR";
import { useRequestDmMutation } from "@/hooks/DM/useRequestDmMutation";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useSendFriendRequestMutation } from "@/hooks/friend/useSendFriendRequestMutation";
import { useApplyGatheringMutation } from "@/hooks/gathering/useApplyGatheringMutation";
import { useApproveParticipantMutation } from "@/hooks/gathering/useApproveParticipantMutation";
import { useBanParticipantMutation } from "@/hooks/gathering/useBanParticipantMutation";
import { useCancelApplyGatheringMutation } from "@/hooks/gathering/useCancelApplyGatheringMutation";
import { useCancelGatheringMutation } from "@/hooks/gathering/useCancelGatheringMutation";
import { useCompleteGatheringMutation } from "@/hooks/gathering/useCompleteGatheringMutation";
import { useEditGatheringMutation } from "@/hooks/gathering/useEditGatheringMutation";
import { useNoShowParticipantMutation } from "@/hooks/gathering/useNoShowParticipantMutation";
import { usePendingParticipantMutation } from "@/hooks/gathering/usePendingParticipantMutation";
import { useStartGatheringMutation } from "@/hooks/gathering/useStartGatheringMutation";
import { useGatheringDetailLanguage } from "@/hooks/Languages/useGatheringDetailLanguage";
import { useCreateReportMutation } from "@/hooks/user/useCreateReportMutation";
import { EditGatheringDto } from "@/types/gathering/EditGatheringDto";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
import { GatheringDetail } from "@/types/gathering/GatheringDetail";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { ReportReason } from "@/types/user/ReportReason";
import { formatDateTime } from "@/utils/formatDateTime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FaceSlightlyFrowning,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Smile,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

export default function GatheringDetailPage() {
  const { t, currentLang } = useGatheringDetailLanguage();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.US,
  );
  const [maxPeople, setMaxPeople] = useState<number | string>("");
  const [location, setLocation] = useState<string>("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDateStr(day.dateString);
  };

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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCloseMenu = () => setActiveMenuUserId(null);

  const refreshGathering = () => {
    queryClient.invalidateQueries({ queryKey: ["gathering", id] });
    queryClient.invalidateQueries({ queryKey: ["gatherings"] });
    queryClient.invalidateQueries({ queryKey: ["my-gatherings"] });
  };

  const {
    data: gathering,
    isPending,
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

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  const isHost = Boolean(
    me?.id && gathering?.hostId && String(me.id) === String(gathering.hostId),
  );

  const { mutate: editGatheringMutate, isPending: editGatheringPending } =
    useEditGatheringMutation(async () => {
      await gatheringRefetch();
      refreshGathering();
      closeEditModal();
    });

  const handleEditGathering = () => {
    if (!title?.trim())
      return alert(`${t.alerts.warning}: ${t.alerts.emptyTitle}`);
    if (!description?.trim())
      return alert(`${t.alerts.warning}: ${t.alerts.emptyDescription}`);
    if (!location?.trim())
      return alert(`${t.alerts.warning}: ${t.alerts.emptyLocation}`);

    if (!maxPeople || isNaN(Number(maxPeople))) {
      return alert(`${t.alerts.warning}: ${t.alerts.invalidMaxPeople}`);
    }

    const [year, month, day] = selectedDateStr.split("-").map(Number);

    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    const editGatheringPayload: EditGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location?.trim(),
      dateTime: finalDate.toISOString(),
    };

    editGatheringMutate({ id, editGatheringPayload });
  };

  const { mutate: applyMutate } = useApplyGatheringMutation(id, async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  const { mutate: cancelApplyMutate } = useCancelApplyGatheringMutation(
    id,
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  const { mutate: approveMutate } = useApproveParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  const { mutate: pendingMutate } = usePendingParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  const { mutate: banMutate } = useBanParticipantMutation(async () => {
    await gatheringRefetch();
    refreshGathering();
  });

  const { mutate: startGatheringMutate } = useStartGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  const { mutate: completeGatheringMutate } = useCompleteGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  const { mutate: cancelGatheringMutate } = useCancelGatheringMutation(
    async () => {
      await gatheringRefetch();
      refreshGathering();
    },
  );

  const handleCompleteCheck = async () => {
    const restParticipants = (gathering?.participants || []).filter(
      (p) => p.status === "APPROVED",
    );

    try {
      if (restParticipants.length > 0) {
        await Promise.all(
          restParticipants.map((p) =>
            client.patch(`/participant/${p.id}/yes-show`),
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["gathering", id] });
      }

      setIsNoShowModalOpen(false);
      alert(`${t.alerts.success}: ${t.alerts.completeCheckSuccess}`);
    } catch (error) {
      alert(`${t.alerts.error}: ${t.alerts.completeCheckFail}`);
    }
  };

  const { mutate: createReportMutate } = useCreateReportMutation(
    () => {
      setIsReportModalOpen(false);
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    () => {
      setIsSubmittingReport(false);
    },
  );

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      alert(`${t.alerts.warning}: ${t.reportDetailsPlaceholder}`);
      return;
    }
    setIsSubmittingReport(true);
    try {
      const createReportPayload: CreateReportDto = {
        reportedUserId: gathering!.hostId,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutate(createReportPayload);
    } catch (error: any) {
      alert(`${t.alerts.error}: ${t.alerts.userNotFound}`);
      setIsSubmittingReport(false);
    }
  };

  const { mutate: blockUserMutate } = useBlockUserMutation();
  const { mutate: sendFriendRequestMutate } = useSendFriendRequestMutation();
  const { mutate: requestDmMutate } = useRequestDmMutation();
  const { mutate: noShowMutate } = useNoShowParticipantMutation(id);

  if (isPending || !gathering) {
    return (
      <div className="flex-1 flex justify-center items-center py-80">
        <div className="animate-spin text-4xl">
          <Image
            src="/logo/sticker.png"
            alt="WeCanZ_sticker"
            width={80}
            height={80}
          />
        </div>
      </div>
    );
  }

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

  const statusStyle = STATUS_COLOR[gathering.status] || {
    bg: "bg-zinc-500/15",
    text: "text-zinc-400",
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center">
      <div className="w-full max-w-4xl flex flex-col min-h-screen pb-20">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="p-1 text-white hover:opacity-70 transition cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-white italic">
            {t.headerTitle}
          </h1>

          <button
            type="button"
            onClick={() => {
              if (!canAccessChat) {
                return alert(
                  `${t.alerts.accessDeniedTitle}\n${t.alerts.accessDeniedMsg}`,
                );
              }
              router.push(`/gathering/${id}/chat`);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer ${
              canAccessChat
                ? "border-[#bef408] bg-[#bef408]/10 text-[#bef408] hover:bg-[#bef408]/20"
                : "border-zinc-700 bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-[#bef408]" />
            <span className="text-xs font-bold text-[#bef408]">
              {t.chatButton}
            </span>
          </button>
        </header>

        {/* 본문 콘텐츠 */}
        <main className="flex-1 px-4 pt-5 flex flex-col gap-4">
          {/* 상태 배너 (COMPLETED) */}
          {gathering.status === "COMPLETED" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-3 flex flex-row justify-between gap-3">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">{t.completedBanner}</span>
              </div>

              {isHost &&
                (gathering.participants || []).some(
                  (p) => p.status === "APPROVED",
                ) && (
                  <button
                    type="button"
                    onClick={() => setIsNoShowModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-red-500 hover:bg-red-600/90 border border-white/10 flex items-center justify-center gap-2 transition cursor-pointer text-white text-xs font-semibold"
                  >
                    <Ban className="w-4 h-4 text-zinc-300" />
                    <span>{t.checkNoShow}</span>
                  </button>
                )}
            </div>
          )}

          {/* 상태 배너 (CANCELED) */}
          {gathering.status === "CANCELED" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold">{t.canceledBanner}</span>
            </div>
          )}

          {/* 뱃지 및 카테고리 / 수정 및 신고 버튼 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${statusStyle.bg} ${statusStyle.text}`}
              >
                {t.statusLabels[gathering.status] || gathering.status}
              </span>
              <span className="text-xs font-bold text-zinc-400">
                {t.categoryLabels[gathering.category] || gathering.category}
              </span>
            </div>

            {isHost &&
              (gathering.status === "OPEN" || gathering.status === "FULL") && (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/15 transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold">
                    {t.edit}
                  </span>
                </button>
              )}
            {!isHost && (
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500 text-xs font-semibold">
                  {t.report}
                </span>
              </button>
            )}
          </div>

          {/* 타이틀 및 설명 */}
          <div className="flex flex-col gap-2 mt-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {gathering.title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {gathering.description}
            </p>
          </div>

          <div />

          {/* 정보 섹션 */}
          <div className="bg-[#18181B] rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-3.5 mb-2.5">
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <Calendar className="w-4 h-4 text-[#bef408] shrink-0" />
              <span>{formatDateTime(gathering.dateTime, currentLang)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gathering.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-200">
              <Users className="w-4 h-4 text-[#bef408] shrink-0" />
              <span>
                {t.participantCount}{" "}
                <strong className="text-[#bef408]">{currentCount}</strong> /{" "}
                {gathering.maxPeople}
                {t.peopleUnit}
              </span>
            </div>

            {gathering.roomCode && (
              <div className=" flex items-center gap-2 text-[13px] text-zinc-400">
                <span>{t.roomCode}</span>
                <span className="bg-zinc-800/80 rounded-xl px-3 py-0.5 font-bold text-[#bef408]">
                  {gathering.roomCode}
                </span>
              </div>
            )}

            {isHost &&
              !(
                gathering.status === "COMPLETED" ||
                gathering.status === "CANCELED"
              ) && (
                <div className="bg-[#2C2C2E]/60 rounded-xl p-3.5 mt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Settings className="w-4 h-4 text-white" />
                    <span>{t.management}</span>
                  </div>

                  <div className="flex gap-2">
                    {(gathering.status === "OPEN" ||
                      gathering.status === "FULL") && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `${t.alerts.startTitle}\n\n${t.alerts.startMsg}`,
                              )
                            ) {
                              startGatheringMutate(id);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-[#bef408] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                        >
                          <span>{t.start}</span>
                          <Smile className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `${t.alerts.cancelTitle}\n\n${t.alerts.cancelMsg}`,
                              )
                            ) {
                              cancelGatheringMutate(id);
                            }
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-700 transition cursor-pointer"
                        >
                          <span>{t.cancel}</span>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {gathering.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `${t.alerts.finishTitle}\n\n${t.alerts.finishMsg}`,
                            )
                          ) {
                            completeGatheringMutate(id);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer"
                      >
                        {t.finish}
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="h-[1px] bg-white/[0.08] my-2" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-[#bef408]" />
              <span>{t.approvedTitle}</span>
            </div>

            {approvedParticipants.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2 text-center">
                {t.emptyApproved}
              </p>
            ) : (
              approvedParticipants.map((p) => (
                <GatheringUserCard
                  key={p.id}
                  user={p.user}
                  roleTag={undefined}
                  participantId={p.id}
                  currentStatus={"APPROVED"}
                  me={me}
                  gathering={gathering}
                  isHost={isHost}
                  activeMenuUserId={activeMenuUserId}
                  setActiveMenuUserId={setActiveMenuUserId}
                  handleCloseMenu={handleCloseMenu}
                  sendFriendRequestMutation={sendFriendRequestMutate}
                  requestDmMutation={requestDmMutate}
                  blockUserMutation={blockUserMutate}
                  pendingMutation={pendingMutate}
                  approveMutation={approveMutate}
                  banMutation={banMutate}
                />
              ))
            )}
          </div>

          <div className="flex flex-col gap-3 mt-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>{t.pendingTitle}</span>
            </div>

            {pendingParticipants.length === 0 ? (
              <p className="text-sm text-zinc-500 py-12 text-center">
                {t.emptyPending}
              </p>
            ) : (
              pendingParticipants.map((p) => (
                <GatheringUserCard
                  key={p.id}
                  user={p.user}
                  roleTag={undefined}
                  participantId={p.id}
                  currentStatus={"PENDING"}
                  me={me}
                  gathering={gathering}
                  isHost={isHost}
                  activeMenuUserId={activeMenuUserId}
                  setActiveMenuUserId={setActiveMenuUserId}
                  handleCloseMenu={handleCloseMenu}
                  sendFriendRequestMutation={sendFriendRequestMutate}
                  requestDmMutation={requestDmMutate}
                  blockUserMutation={blockUserMutate}
                  pendingMutation={pendingMutate}
                  approveMutation={approveMutate}
                  banMutation={banMutate}
                />
              ))
            )}
          </div>

          {!isHost &&
            (gathering.status === "OPEN" || gathering.status === "FULL") && (
              <div className="mt-4">
                {myParticipant ? (
                  myParticipant.status !== "BANNED" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `${t.alerts.cancelApplyTitle}\n\n${t.alerts.cancelApplyMsg}`,
                          )
                        ) {
                          cancelApplyMutate();
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {t.cancelApply}{" "}
                      <FaceSlightlyFrowning className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => applyMutate()}
                    className="w-full py-3.5 rounded-xl bg-[#bef408] text-black font-bold text-sm flex items-center justify-center hover:opacity-90 transition cursor-pointer gap-1"
                  >
                    {t.apply} <Smile className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
        </main>
      </div>

      <GatheringModal
        mode="edit"
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        category={category}
        setCategory={setCategory}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
        selectedDateStr={selectedDateStr}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        selectedMinute={selectedMinute}
        setSelectedMinute={setSelectedMinute}
        maxPeople={maxPeople}
        setMaxPeople={setMaxPeople}
        onSubmit={handleEditGathering}
        isPending={editGatheringPending}
        handleDayPress={handleDayPress}
      />

      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetNickname={gathering.host?.nickname}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        reportDetails={reportDetails}
        onChangeReportDetails={setReportDetails}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
        isEditable={false}
      />

      <NoShowModal
        isOpen={isNoShowModalOpen}
        onClose={() => setIsNoShowModalOpen(false)}
        participants={gathering?.participants}
        meId={me?.id}
        noShowMutation={noShowMutate}
        handleCompleteCheck={handleCompleteCheck}
      />
    </div>
  );
}
