"use client";

import { deleteTokenFromServer } from "@/api/user/deleteTokenFromServer";
import { getMyInfo } from "@/api/user/getMyInfo";
import { saveTokenToServer } from "@/api/user/saveTokenToServer";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { updateProfile } from "@/api/user/updateProfile";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ReportModal } from "@/components/ReportModal";
import { SearchUserModal } from "@/components/SearchUserModal";
import { useSettingLanguage } from "@/hooks/Languages/useSettingLanguage";
import { useCreateReportMutation } from "@/hooks/user/useCreateReportMutation";
import { useDeleteAccountMutation } from "@/hooks/user/useDeleteAccountMutation";
import { useUpdateProfileMutation } from "@/hooks/user/useUpdateProfileMutation";
import { CreateReportDto } from "@/types/user/CreateReportDto";
import { MyInfo } from "@/types/user/MyInfo";
import { ReportReason } from "@/types/user/ReportReason";
import { UpdateProfileDto } from "@/types/user/UpdateProfileDto";
import { deactivateAuth } from "@/utils/deactivateAuth";
import { handleImagePick } from "@/utils/handleImagePick";
import { uploadProfileImage } from "@/utils/uploadProfileImage";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  FileText,
  Loader2,
  LogOut,
  Megaphone,
  Moon,
  Pencil,
  Search,
  Shield,
  ShoppingBag,
  User,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingPage() {
  const { t } = useSettingLanguage();
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchNickname, setSearchNickname] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReportReason>(
    ReportReason.SPAM,
  );
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const {
    data: me,
    isPending: myInfoPending,
    isError: myInfoError,
  } = useQuery<MyInfo>({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
  });

  useEffect(() => {
    if (me) {
      setNickname(me.nickname || "");
      setBio(me.bio || "");
      setProfileImage(me.profileImage || "");
      setIsMarketingAgreed(!!me.marketingAgreedAt);
    }
  }, [me]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: updateProfileMutate, isPending: updateProfilePending } =
    useUpdateProfileMutation(t, () => {
      setIsModalOpen(false);
    });

  const handleSaveProfile = async () => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      alert(`${t.alerts.warning}: ${t.alerts.absentNickname}`);
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 30) {
      alert(`${t.alerts.warning}: ${t.alerts.nicknameAlert}`);
      return;
    }

    let finalImageUrl = profileImage;

    try {
      if (
        profileImage &&
        (profileImage.startsWith("file://") ||
          profileImage.startsWith("content://"))
      ) {
        const data = await uploadProfileImage(profileImage);
        if (data?.imageUrl) {
          finalImageUrl = data.imageUrl;
        }
      }

      const updateProfilePayload: UpdateProfileDto = {
        nickname,
        bio,
        profileImage: finalImageUrl,
      };

      updateProfileMutate(updateProfilePayload);
    } catch (error) {
      console.error(error);
      alert(`${t.alerts.error}: ${t.alerts.uploadImageError}`);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: deleteAccountMutate } = useDeleteAccountMutation(
    t,
    deactivateAuth,
  );

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        `${t.alerts.deleteAccountTitle}\n\n${t.alerts.deleteAccountConfirm}`,
      )
    ) {
      deleteAccountMutate();
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleLogout = () => {
    if (
      window.confirm(`${t.alerts.logoutTitle}\n\n${t.alerts.logoutConfirm}`)
    ) {
      deactivateAuth();
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: createReportMutate } = useCreateReportMutation(
    () => {
      setIsReportModalOpen(false);
      setTargetNickname("");
      setSelectedReason(ReportReason.SPAM);
      setReportDetails("");
    },
    () => {
      setIsSubmittingReport(false);
    },
  );

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmitReport = async () => {
    if (!targetNickname.trim()) {
      alert(`${t.alerts.warning}: ${t.reportTargetPlaceholder}`);
      return;
    }
    if (!reportDetails.trim()) {
      alert(`${t.alerts.warning}: ${t.reportDetailsPlaceholder}`);
      return;
    }

    setIsSubmittingReport(true);

    try {
      const searchedUser = await searchUserByNickname(targetNickname.trim());

      if (!searchedUser || !searchedUser.id) {
        alert(`${t.alerts.error}: ${t.alerts.userNotFound}`);
        setIsSubmittingReport(false);
        return;
      }

      const createReportPayload: CreateReportDto = {
        reportedUserId: searchedUser.id,
        reason: selectedReason,
        details: reportDetails.trim(),
      };

      createReportMutate(createReportPayload);
    } catch (error: any) {
      alert(`${t.alerts.error}: ${t.alerts.userNotFound}`);
      setIsSubmittingReport(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleSearchProfile = async () => {
    if (!searchNickname.trim()) {
      alert(`${t.alerts.notice}: ${t.alerts.enterNicknameAlert}`);
      return;
    }

    try {
      const searchedUser = await searchUserByNickname(searchNickname.trim());
      if (searchedUser && searchedUser.id) {
        setIsModalVisible(false);
        setSearchNickname("");
        router.push(`/profile/${searchedUser.id}`);
      }
    } catch (error: any) {
      alert(`${t.alerts.error}: ${t.alerts.userNotFound}`);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleToggleMarketing = async (value: boolean) => {
    setIsMarketingAgreed(value);

    try {
      if (value) {
        await updateProfile({
          marketingAgreedAt: new Date().toISOString(),
        });
      } else {
        await updateProfile({
          marketingAgreedAt: null,
        });
      }
    } catch (error) {
      setIsMarketingAgreed(!value);
      alert(`${t.alerts.notice}: ${t.alerts.marketingAgreeError}`);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (myInfoPending) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#bef408]" />
      </div>
    );
  }

  if (myInfoError || !me) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-zinc-400">
        {t.alerts.userNotFound}
      </div>
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#121212] text-white flex justify-center pb-10">
      <div className="w-full max-w-3xl flex flex-col min-h-screen ">
        {/* 상단 헤더 */}
        <header className="top-0 z-10 bg-[#121212]/90 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-white/[0.08]">
          <h1 className="text-3xl font-extrabold text-[#bef408] italic tracking-tight">
            {t.headerTitle}
          </h1>

          <button
            type="button"
            onClick={() => setIsModalVisible(true)}
            className="p-1 text-[#bef408] hover:opacity-80 transition cursor-pointer"
          >
            <Search className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 px-4 py-4 flex flex-col  gap-5">
          {/* 프로필 카드 */}
          <div className="bg-[#18181B] rounded-[20px] p-5 border border-white/[0.08] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              {me.profileImage ? (
                <img
                  src={me.profileImage}
                  alt="Profile"
                  className="w-[72px] h-[72px] rounded-full border-2 border-[#bef408] object-cover"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full border-2 border-[#bef408] bg-zinc-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/15 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-semibold">
                  {t.editButton}
                </span>
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1.5">
                {me.nickname}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {me.bio || t.emptyBio}
              </p>
            </div>

            <div className="flex bg-[#2C2C2E] rounded-xl py-3 items-center">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-zinc-400 mb-1">{t.yesShow}</span>
                <span className="text-base font-bold text-[#bef408]">
                  {me.yesShowCount ?? 0}
                </span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-zinc-400 mb-1">{t.noShow}</span>
                <span className="text-base font-bold text-red-500">
                  {me.noShowCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* 앱 설정 섹션 */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold text-zinc-400 ml-1">
              {t.sectionApp}
            </span>
            <div className="bg-[#18181B] rounded-2xl border border-white/[0.08] overflow-hidden">
              {/* 이용약관 */}
              <button
                type="button"
                onClick={() =>
                  window.open("https://www.wecanbegenz.com/terms", "_blank")
                }
                className="w-full flex justify-between items-center px-4 py-4 border-b border-white/[0.05] hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">
                    {t.menuTerms}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* 개인정보 처리방침 */}
              <button
                type="button"
                onClick={() =>
                  window.open("https://www.wecanbegenz.com/privacy", "_blank")
                }
                className="w-full flex justify-between items-center px-4 py-4 border-b border-white/[0.05] hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">
                    {t.menuPrivacy}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* 마케팅 정보 수신 */}
              <button
                type="button"
                onClick={() =>
                  window.open("https://www.wecanbegenz.com/marketing", "_blank")
                }
                className="w-full flex justify-between items-center px-4 py-4 border-b border-white/[0.05] hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">
                    {t.menuMarketing}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* 마케팅 동의 토글 */}
              <div className="flex justify-between items-center px-4 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-white">
                    {t.menuMarketingAgree}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMarketingAgreed}
                    onChange={(e) => handleToggleMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bef408] peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* 유저 신고 */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="w-full flex justify-between items-center px-4 py-4 hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    {t.menuReport}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* 계정 관리 섹션 */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold text-zinc-400 ml-1">
              {t.sectionAccount}
            </span>
            <div className="bg-[#18181B] rounded-2xl border border-white/[0.08] overflow-hidden">
              {/* 로그아웃 */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-between items-center px-4 py-4 border-b border-white/[0.05] hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    {t.menuLogout}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* 회원 탈퇴 */}
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full flex justify-between items-center px-4 py-4 hover:bg-white/5 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <UserX className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    {t.menuDeleteAccount}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>
        </main>
      </div>

      <EditProfileModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileImage={profileImage}
        onImagePick={() => handleImagePick(setProfileImage)}
        setProfileImage={setProfileImage}
        nickname={nickname}
        onChangeNickname={setNickname}
        bio={bio}
        onChangeBio={setBio}
        onSave={handleSaveProfile}
        isPending={updateProfilePending}
        t={t}
      />

      <SearchUserModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        searchNickname={searchNickname}
        onChangeSearchNickname={setSearchNickname}
        onSearch={handleSearchProfile}
        t={t}
      />

      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetNickname={targetNickname}
        onChangeTargetNickname={setTargetNickname}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        reportDetails={reportDetails}
        onChangeReportDetails={setReportDetails}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />
    </div>
  );
}
