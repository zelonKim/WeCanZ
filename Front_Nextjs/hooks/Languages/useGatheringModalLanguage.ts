import { useEffect, useState } from "react";

const translations = {
  ko: {
    newMeetup: "New 밋업 만들기",
    editMeetup: "밋업 정보 수정",
    us: " 🇺🇸 미국",
    uk: " 🇬🇧 영국",
    kr: " 🇰🇷 한국",
    categoryLabel: "국가",
    titleLabel: "모임 제목",
    titlePlaceholder: "모임 제목을 입력해주세요.",
    descLabel: "상세 설명",
    descPlaceholder: "모임에 대한 설명을 입력해주세요.",
    locationLabel: "모임 장소",
    locationPlaceholder: "모임 장소를 입력해주세요.",
    dateLabel: "모임 날짜 선택",
    timeLabel: "모임 시간 선택",
    maxPeopleLabel: "최대 인원 (명)",
    createBtn: "방 만들기",
    editBtn: "수정하기",
    hour: "시",
    minute: "분",
  },
  en: {
    newMeetup: "Create New Meetup",
    editMeetup: "Edit Meetup",
    us: " 🇺🇸 US",
    uk: " 🇬🇧 UK",
    kr: " 🇰🇷 KR",
    categoryLabel: "Category",
    titleLabel: "Title",
    titlePlaceholder: "Enter meetup title.",
    descLabel: "Description",
    descPlaceholder: "Enter description about the meetup.",
    locationLabel: "Location",
    locationPlaceholder: "Enter location.",
    dateLabel: "Select Date",
    timeLabel: "Select Time",
    maxPeopleLabel: "Max People",
    createBtn: "Create Room",
    editBtn: "Update",
    hour: " Hr",
    minute: " Min",
  },
};

export const useGatheringModalLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"ko" | "en">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const browserLang = navigator.language || navigator.languages[0];
      const langCode = browserLang.toLowerCase().startsWith("ko") ? "ko" : "en";
      setCurrentLang(langCode);
    }
  }, []);

  const t = translations[currentLang] || translations.en;

  return { t, currentLang };
};
