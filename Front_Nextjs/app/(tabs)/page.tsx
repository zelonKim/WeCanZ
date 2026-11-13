"use client";

import { client } from "@/api/client";
import { getGatherings } from "@/api/gathering/getGatherings";

import { GatheringModal } from "@/components/GatheringModal";
import { InviteCodeModal } from "@/components/InviteCodeModal";
import { MeetupItem } from "@/components/MeetupItem";
import { CATEGORIES } from "@/constants/CATEGORIES";
import { GREEN_COLOR } from "@/constants/Colors";
import { useCreateGatheringMutation } from "@/hooks/gathering/useCreateGatheringMutation";
import { useJoinGatheringMutation } from "@/hooks/gathering/useJoinGatheringMutation";
import { useHomeLanguage } from "@/hooks/Languages/useHomeLanguage";
import { CreateGatheringDto } from "@/types/gathering/CreateGatheringDto";
import { Gathering } from "@/types/gathering/Gathering";
import { GatheringCategory } from "@/types/gathering/GatheringCategory";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const { t, currentLang } = useHomeLanguage();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GatheringCategory>(
    GatheringCategory.US,
  );
  const [maxPeople, setMaxPeople] = useState("8");
  const [location, setLocation] = useState("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDateStr(day.dateString);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setCategory(GatheringCategory.KR);
    setMaxPeople("8");
    setLocation("");
    setSelectedDateStr(new Date().toISOString().split("T")[0]);
    setSelectedHour(new Date().getHours());
    setSelectedMinute(0);
  };

  const handleChangeCode = (text: string) => {
    setInviteCode(text.toLowerCase());
  };

  const handleCloseInviteModal = () => {
    setInviteCode("");
    setIsInviteModalOpen(false);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  useEffect(() => {
    if (me && (!me.termsAgreedAt || !me.privacyAgreedAt)) {
      router.replace("/login");
    }
  }, [me, router]);

  ////////////////////////////////////////////////////////////////////////////////////

  const { data: gatherings = [], isLoading } = useQuery<Gathering[]>({
    queryKey: ["gatherings"],
    queryFn: getGatherings,
    refetchInterval: 15000,
  });

  const filteredGatherings = gatherings.filter((item) => {
    const isNotCanceled = item.status !== "CANCELED";
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return isNotCanceled && matchesCategory;
  });

  ////////////////////////////////////////////////////////////////////////////////////

  const { mutate: joinGatheringMutate } = useJoinGatheringMutation(t, () => {
    setInviteCode("");
    setIsInviteModalOpen(false);
  });

  const handleEnterRoom = () => {
    const cleanInviteCode = inviteCode.trim().toLowerCase();
    if (!cleanInviteCode || cleanInviteCode.length !== 4) {
      alert(`${t.alerts.title}\n${t.alerts.roomCodeLength}`);
      return;
    }

    joinGatheringMutate(cleanInviteCode);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const { mutate: createGatheringMutate, isPending: createGatheringPending } =
    useCreateGatheringMutation(t, closeAndResetModal);

  const handleCreateGathering = () => {
    if (!title.trim())
      return alert(`${t.alerts.title}\n${t.alerts.titleRequired}`);
    if (!description.trim())
      return alert(`${t.alerts.title}\n${t.alerts.descRequired}`);
    if (!location.trim())
      return alert(`${t.alerts.title}\n${t.alerts.locationRequired}`);
    if (!maxPeople || isNaN(Number(maxPeople))) {
      return alert(`${t.alerts.title}\n${t.alerts.invalidPeople}`);
    }
    if (Number(maxPeople) < 2) {
      return alert(`${t.alerts.title}\n${t.alerts.minPeople}`);
    }
    if (Number(maxPeople) > 20) {
      return alert(`${t.alerts.title}\n${t.alerts.maxPeople}`);
    }

    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const finalDate = new Date(
      year,
      month - 1,
      day,
      selectedHour,
      selectedMinute,
    );

    const createGatheringPayload: CreateGatheringDto = {
      title,
      description,
      category,
      maxPeople: Number(maxPeople),
      location: location.trim(),
      dateTime: finalDate.toISOString(),
    };

    createGatheringMutate(createGatheringPayload);
  };

  ////////////////////////////////////////////////////////////////////////////////////

  return (
    <main className="min-h-screen bg-[#121212] text-white flex flex-col relative pb-20">
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#27272A] mb-3">
        <h1
          className="text-3xl font-extrabold italic tracking-tight"
          style={{ color: GREEN_COLOR }}
        >
          {t.headerTitle}
        </h1>

        <button
          type="button"
          onClick={() => {
            setIsInviteModalOpen(true);
            setInviteCode("");
          }}
          className="flex items-center px-3 py-2 rounded-full hover:bg-zinc-800/80 transition cursor-pointer"
        >
          <QrCode className="w-5 h-5" style={{ color: GREEN_COLOR }} />
        </button>
      </header>

      {/* 카테고리 칩 스크롤 */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-none flex gap-2">
        {CATEGORIES(t).map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition shrink-0 cursor-pointer border ${
                isActive
                  ? "bg-[#bef408] text-black border-[#bef408] font-extrabold"
                  : "bg-[#1C1C1E] hover:bg-zinc-800/80  text-[#A1A1AA] border-white/5 hover:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-5 pb-24 ">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: GREEN_COLOR }}
            />
          </div>
        ) : filteredGatherings.length === 0 ? (
          <div className="py-28 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3"></span>
            <p className="text-[15px] text-[#71717A] leading-relaxed font-medium">
              {t.emptyText}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredGatherings.map((item) => (
              <MeetupItem
                key={item.id}
                item={item}
                t={t}
                currentLang={currentLang}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="z-50 fixed right-10 bottom-24 w-14 h-14 rounded-full bg-[#bef408] text-black flex items-center justify-center shadow-lg hover:opacity-95 active:scale-95 transition cursor-pointer z-20"
          style={{ boxShadow: "0 6px 20px rgba(190, 244, 8, 0.35)" }}
        >
          <Plus className="w-8 h-8 stroke-[2]" />
        </button>
      </div>

      <GatheringModal
        mode="create"
        isOpen={isModalOpen}
        onClose={closeAndResetModal}
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
        onSubmit={handleCreateGathering}
        isPending={createGatheringPending}
        handleDayPress={handleDayPress}
      />

      {/* 초대 코드 입력 모달 */}
      <InviteCodeModal
        visible={isInviteModalOpen}
        inviteCode={inviteCode}
        onChangeCode={handleChangeCode}
        onClose={handleCloseInviteModal}
        onSubmit={handleEnterRoom}
        isLoading={isInviteLoading}
        t={t}
      />
    </main>
  );
}
