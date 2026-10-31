"use client";

import { client } from "@/api/client";
import { removeAccessToken } from "@/api/token";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  SearchOutline,
  Person,
  Pencil,
  ShieldCheckmarkOutline,
  DocumentTextOutline,
  MegaphoneOutline,
  LogOutOutline,
  PersonRemoveOutline,
  ChevronForward,
  Close,
  Camera,
} from "react-ionicons";

// 신고 사유 Enum (백엔드 ReportReason Enum 매핑)
enum ReportReason {
  SPAM = "SPAM",
  INAPPROPRIATE = "INAPPROPRIATE",
  ABUSE = "ABUSE",
  IMPERSONATION = "IMPERSONATION",
  OTHER = "OTHER",
}

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  [ReportReason.SPAM]: "불법 광고 및 도배",
  [ReportReason.INAPPROPRIATE]: "부적절한 콘텐츠",
  [ReportReason.ABUSE]: "욕설 및 혐오 발언",
  [ReportReason.IMPERSONATION]: "사칭 및 허위 정보",
  [ReportReason.OTHER]: "기타",
};

// API 요청 함수
const fetchMyInfo = async () => {
  const { data } = await client.get("/user/me");
  return data;
};

const updateProfile = async (updateDto: {
  nickname?: string;
  bio?: string;
  profileImage?: string;
  isMarketingAgreed?: boolean;
}) => {
  const { data } = await client.patch("/user/profile", updateDto);
  return data;
};

const deleteAccount = async () => {
  try {
    const { data } = await client.delete("/user/account");
    return data;
  } catch (error: any) {
    console.log(
      "=== 회원탈퇴 에러 상세 ===",
      error.response?.status,
      error.response?.data,
    );
  }
};

// 닉네임으로 유저 ID 조회 API
const searchUserByNickname = async (nickname: string) => {
  const { data } = await client.get(
    `/user/search/${encodeURIComponent(nickname)}`,
  );
  return data;
};

// 신고 API 요청 함수
const createReport = async (reportDto: {
  reportedUserId: string;
  reason: ReportReason;
  details: string;
}) => {
  const { data } = await client.post("/reports", reportDto);
  return data;
};

export default function SettingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 프로필 조회 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");

  const handleSearchUser = async () => {
    if (!searchNickname.trim()) {
      alert("유저 닉네임을 입력해주세요.");
      return;
    }

    try {
      const { data } = await client.get(
        `/user/search/${encodeURIComponent(searchNickname.trim())}`,
      );

      if (data && data.id) {
        setIsModalVisible(false);
        setSearchNickname("");
        router.push(`/profile/${data.id}`);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "존재하지 않는 유저입니다.";
      alert(message);
    }
  };

  // 내 정보 조회
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: fetchMyInfo,
  });

  // 프로필 수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // 신고 모달 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // 마케팅 동의 즉각 반영용 로컬 상태
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  // 서버 데이터 로드시 로컬 상태 동기화
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setBio(user.bio || "");
      setProfileImage(user.profileImage || "");
      setIsMarketingAgreed(!!user.marketingAgreedAt);
    }
  }, [user]);

  // 프로필 수정 Mutation
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data, variables) => {
      if (variables.isMarketingAgreed === undefined) {
        alert("프로필이 성공적으로 수정되었습니다. ⚡");
        setIsModalOpen(false);
      }
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      alert(displayMessage || "처리 중 오류가 발생했습니다.");
    },
  });

  // 신고 Mutation
  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      alert("신고가 성공적으로 접수되었습니다.");
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "신고 접수 중 오류가 발생했습니다.";
      alert(msg);
    },
    onSettled: () => {
      setIsSubmittingReport(false);
    },
  });

  // 회원 탈퇴 Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      alert("회원 탈퇴가 완료되었습니다.");
      await removeAccessToken();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.";
      alert(msg);
    },
  });

  // 웹 파일 업로드 핸들러 (input type="file" 활용)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setProfileImage(localUrl);
      // 실제 웹 환경에서는 file 객체를 바로 서버/R2에 업로드하거나 프리사인드 URL 방식으로 처리해야 합니다.
    }
  };

  // 프로필 저장
  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    let finalImageUrl = profileImage;

    try {
      if (profileImage) {
        const data = await uploadProfileImage(profileImage);
        if (data?.imageUrl) {
          finalImageUrl = data.imageUrl; // R2에서 받아온 공개 URL로 교체
        }
      }

      // 💡 R2 업로드가 끝난 최종 URL을 담아 기존 mutation 실행
      profileMutation.mutate({
        nickname,
        bio,
        profileImage: finalImageUrl,
      });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("프로필 이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  // 신고 제출
  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      alert("신고할 유저의 닉네임을 입력해주세요.");
      return;
    }
    if (!reportDetails.trim()) {
      alert("상세 신고 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingReport(true);

    try {
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        alert("해당 닉네임을 가진 유저를 찾을 수 없습니다.");
        setIsSubmittingReport(false);
        return;
      }

      reportMutation.mutate({
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "존재하지 않는 유저이거나 조회 실패했습니다.";
      alert(msg);
      setIsSubmittingReport(false);
    }
  };

  // 로그아웃
  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      (async () => {
        await removeAccessToken();
        queryClient.clear();
        router.replace("/login");
      })();
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "정말로 탈퇴하시겠습니까?\n계정 정보와 모든 데이터가 삭제되며 복구할 수 없습니다.",
      )
    ) {
      deleteAccountMutation.mutate();
    }
  };

  const openTerms = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-68">
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

  if (isError || !user) {
    router.replace("/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="text-zinc-500">유저 정보를 불러올 수 없습니다.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen  text-white max-w-4xl w-full mx-auto pb-6">
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="text-[28px] text-[#bef408] font-bold italic">
          Settings
        </h1>
        <button
          onClick={() => setIsModalVisible(true)}
          className="p-2  hover:bg-zinc-800 rounded-2xl transition cursor-pointer"
        >
          <SearchOutline color="#bef408" height="25px" width="25px" />
        </button>
      </div>

      <div className="px-4 space-y-6">
        {/* 프로필 카드 */}
        <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-18 h-18 rounded-full border-2 border-[#bef408] object-cover"
                style={{ width: 72, height: 72 }}
              />
            ) : (
              <div
                className="w-18 h-18 rounded-full border-2 border-[#bef408] flex items-center justify-center bg-zinc-800"
                style={{ width: 72, height: 72 }}
              >
                <Person color="#FFF" height="40px" width="40px" />
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 bg-zinc-800 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-zinc-700 transition"
            >
              <Pencil color="#FFF" height="14px" width="14px" />
              <span>편집</span>
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-[22px] font-bold mb-1.5">{user.nickname}</h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              {user.bio || "아직 작성된 자기소개가 없습니다."}
            </p>
          </div>

          {/* 신뢰도/매너 배지 */}
          <div className="flex bg-[#2C2C2E] rounded-xl py-3 items-center">
            <div className="flex-1 text-center">
              <span className="text-sm text-zinc-400 block mb-1">예스쇼</span>
              <span className="text-base font-bold text-[#bef408]">
                {user.yesShowCount ?? 0}회
              </span>
            </div>
            <div className="w-[1px] h-6 bg-zinc-700" />
            <div className="flex-1 text-center">
              <span className="text-sm text-zinc-400 block mb-1">노쇼</span>
              <span className="text-base font-bold text-red-500">
                {user.noShowCount ?? 0}회
              </span>
            </div>
          </div>
        </div>

        {/* 설정 메뉴 */}
        <div>
          <span className="text-sm font-semibold text-zinc-400 ml-1 mb-2 block">
            앱 설정
          </span>
          <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => openTerms("https://www.jongtaewon.com/terms")}
              className="w-full flex justify-between items-center px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheckmarkOutline
                  color="#8E8E93"
                  height="18px"
                  width="18px"
                />
                <span className="text-base font-medium">서비스 이용약관</span>
              </div>
              <ChevronForward color="#8E8E93" height="18px" width="18px" />
            </button>

            <button
              onClick={() => openTerms("https://www.jongtaewon.com/privacy")}
              className="w-full flex justify-between items-center px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <DocumentTextOutline
                  color="#8E8E93"
                  height="18px"
                  width="18px"
                />
                <span className="text-base font-medium">개인정보 처리방침</span>
              </div>
              <ChevronForward color="#8E8E93" height="18px" width="18px" />
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full flex justify-between items-center px-4 py-4 hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MegaphoneOutline color="#FF453A" height="18px" width="18px" />
                <span className="text-base font-medium text-red-500">
                  신고하기
                </span>
              </div>
              <ChevronForward color="#8E8E93" height="18px" width="18px" />
            </button>
          </div>
        </div>

        {/* 계정 관리 */}
        <div>
          <span className="text-sm font-semibold text-zinc-400 ml-1 mb-2 block">
            계정 관리
          </span>
          <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex justify-between items-center px-4 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOutOutline color="#FFF" height="18px" width="18px" />
                <span className="text-base font-medium">로그아웃</span>
              </div>
              <ChevronForward color="#8E8E93" height="18px" width="18px" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex justify-between items-center px-4 py-4 hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <PersonRemoveOutline
                  color="#FF453A"
                  height="18px"
                  width="18px"
                />
                <span className="text-base font-medium text-red-500">
                  회원 탈퇴
                </span>
              </div>
              <ChevronForward color="#8E8E93" height="18px" width="18px" />
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 수정 모달 */}
      {isModalOpen && (
        <div className=" mb-16 fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1C1C1E] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">프로필 수정</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <div className="cursor-pointer hover:bg-zinc-700 transition p-1 rounded-xl">
                  <Close color="#FFF" height="22px" width="22px" />
                </div>
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div className="flex flex-col items-center ">
                <label className="relative cursor-pointer hover:opacity-80">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="profile"
                      className="w-20 h-20 rounded-full border-2 border-[#bef408] object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-[#bef408] flex items-center justify-center bg-zinc-800">
                      <Person color="#FFF" height="40px" width="40px" />
                    </div>
                  )}
                  <div className="absolute right-0 bottom-0 bg-[#bef408] rounded-full p-1.5 shadow">
                    <Camera color="#000" height="14px" width="14px" />
                  </div>
                </label>
                {profileImage && (
                  <button
                    onClick={() => setProfileImage("")}
                    className="text-xs text-zinc-400 mt-2 underline"
                  >
                    이미지 제거
                  </button>
                )}
                <span className="text-xs text-zinc-500 mt-1">
                  이미지를 터치하여 파일을 선택하세요
                </span>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-400 block mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full bg-[#2C2C2E] rounded-xl px-3.5 py-3 font-bold text-base text-white outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-400 block mb-1">
                  자기소개
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="자기소개를 입력하세요"
                  rows={3}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3.5 py-3 font-medium text-base text-white outline-none focus:ring-1 focus:ring-yellow-400 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={profileMutation.isPending}
              className="w-full bg-[#bef408] text-black py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {profileMutation.isPending ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      )}

      {/* 신고하기 모달 */}
      {isReportModalOpen && (
        <div className="mb-16 fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1C1C1E] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">🚨 유저 신고하기</h3>
              <button onClick={() => setIsReportModalOpen(false)}>
                <Close color="#FFF" height="22px" width="22px" />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm font-semibold text-zinc-400 block mb-1">
                  신고할 유저 닉네임
                </label>
                <input
                  type="text"
                  value={targetNickname}
                  onChange={(e) => setTargetNickname(e.target.value)}
                  placeholder="상대방 닉네임을 입력해주세요"
                  className="w-full bg-[#2C2C2E] rounded-xl px-3.5 py-3 text-base text-white outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-400 block mb-1">
                  신고 사유 선택
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ReportReason).map((reason) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
                          isSelected
                            ? "bg-red-500/15 border-red-500 text-red-500 font-semibold"
                            : "bg-[#2C2C2E] border-transparent text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {REPORT_REASON_LABELS[reason]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-400 block mb-1">
                  상세 내용
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="신고 사유에 대한 상세 내용을 적어주세요."
                  rows={3}
                  className="w-full bg-[#2C2C2E] rounded-xl px-3.5 py-3 text-[15px] text-white outline-none resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmitReport}
              disabled={isSubmittingReport}
              className="w-full bg-red-500 text-white py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmittingReport ? "접수 중..." : "신고 접수하기"}
            </button>
          </div>
        </div>
      )}

      {/* 닉네임 검색 모달 */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] w-full max-w-sm rounded-2xl p-5 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold text-center">
              🔍 유저 프로필 찾기
            </h3>
            <p className="text-sm text-zinc-400 text-center -mt-2">
              찾고 싶은 유저의 닉네임을 입력하세요.
            </p>

            <input
              type="text"
              placeholder="닉네임 입력"
              value={searchNickname}
              onChange={(e) => setSearchNickname(e.target.value)}
              className="w-full bg-[#2C2C2E] rounded-xl px-3.5 py-3 text-[15px]  text-white outline-none"
            />

            <div className="flex gap-2.5">
              <button
                onClick={() => setIsModalVisible(false)}
                className="flex-1 bg-[#2C2C2E] py-3 rounded-xl font-semibold text-[15px] text-white hover:bg-zinc-700 transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSearchUser}
                disabled={isLoading}
                className="flex-1 bg-[#bef408] py-3 rounded-xl font-bold text-[15px] text-black hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                검색하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
