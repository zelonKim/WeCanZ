"use client";

import TermsModal from "@/components/TermsModal";
import { getMyInfo } from "@/api/user/getMyInfo";
import { useAgreementLanguage } from "@/hooks/Languages/useAgreementLanguage";
import { useCompleteAgreeMutation } from "@/hooks/user/useCompleteAgreeMutation";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";
import { CompleteAgreePayload } from "@/types/user/CompleteAgreePayload";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Loader2, Square } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgreementPage() {
  const { t } = useAgreementLanguage();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [modalType, setModalType] = useState<AgreementModalTypes | null>(null);

  const isFormValid =
    nickname.trim().length > 0 && termsAgreed && privacyAgreed;

  const handleAllAgree = () => {
    const nextState = !(termsAgreed && privacyAgreed && isMarketingAgreed);
    setTermsAgreed(nextState);
    setPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  //////////////////////////////////////////////////////////////////////////

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  useEffect(() => {
    if (me?.nickname) {
      setNickname(me.nickname);
    }
  }, [me]);

  useEffect(() => {
    if (me?.privacyAgreedAt && me?.termsAgreedAt) {
      router.push("/");
    }
  });

  
  //////////////////////////////////////////////////////////////////////////

  const { mutate: completeAgreeMutate, isPending: completeAgreePending } =
    useCompleteAgreeMutation(t);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!nickname.trim()) {
      alert(`${t.alerts.warning}\n${t.alerts.nicknameRequired}`);
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      alert(`${t.alerts.warning}\n${t.alerts.termsRequired}`);
      return;
    }

    const completeAgreePayload: CompleteAgreePayload = {
      nickname,
      isMarketingAgreed,
    };

    completeAgreeMutate(completeAgreePayload);
  };

  //////////////////////////////////////////////////////////////////////////

  const isAllAgreed = termsAgreed && privacyAgreed && isMarketingAgreed;

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* 상단 타이틀 및 스티커 이미지 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold flex items-center gap-1 text-[#bef408]">
              {t.title}
            </h1>
            <Image
              src="/logo/sticker.png"
              alt="sticker"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <p className="text-sm text-[#8E8E93] -mt-2">{t.subtitle}</p>
        </div>

        {/* 닉네임 입력 폼 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">
            {t.nicknameLabel}
          </label>
          <input
            type="text"
            className="bg-[#1C1C1E] h-[52px] rounded-[10px] px-4 text-white text-[15px] placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-[#bef408]"
            placeholder={t.nicknamePlaceholder}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            autoCapitalize="none"
          />
        </div>

        {/* 약관 동의 섹션 */}
        <div className="bg-[#1C1C1E] p-4 rounded-xl flex flex-col gap-3.5">
          {/* 전체 동의 버튼 */}
          <button
            type="button"
            onClick={handleAllAgree}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            {isAllAgreed ? (
              <CheckSquare className="w-5 h-5 shrink-0 text-[#bef408]" />
            ) : (
              <Square className="w-5 h-5 text-[#666] shrink-0" />
            )}
            <span className="text-[15px] font-bold text-white">
              {t.allAgree}
            </span>
          </button>

          <div className="h-[1px] bg-[#2C2C2E] my-1 " />

          {/* 서비스 이용약관 (필수) */}
          <div className="flex items-center justify-between ml-1">
            <button
              type="button"
              onClick={() => setTermsAgreed(!termsAgreed)}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              {termsAgreed ? (
                <CheckSquare className="w-4 h-4 shrink-0 text-[#bef408]" />
              ) : (
                <Square className="w-4 h-4 text-[#666] shrink-0" />
              )}
              <span className="text-sm text-[#CCC]  leading-tight">
                {t.termsAgree}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setModalType("terms")}
              className="text-[13px] text-[#8E8E93] underline hover:text-white transition cursor-pointer shrink-0"
            >
              {t.viewLink}
            </button>
          </div>

          {/* 개인정보 처리방침 (필수) */}
          <div className="flex items-center justify-between ml-1">
            <button
              type="button"
              onClick={() => setPrivacyAgreed(!privacyAgreed)}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              {privacyAgreed ? (
                <CheckSquare className="w-4 h-4 shrink-0 text-[#bef408]" />
              ) : (
                <Square className="w-4 h-4 text-[#666] shrink-0" />
              )}
              <span className="text-sm text-[#CCC]  leading-tight line-clamp-2">
                {t.privacyAgree}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setModalType("privacy")}
              className="text-[13px] text-[#8E8E93] underline hover:text-white transition cursor-pointer shrink-0"
            >
              {t.viewLink}
            </button>
          </div>

          {/* 마케팅 수신 동의 (선택) */}
          <div className="flex items-center justify-between ml-1">
            <button
              type="button"
              onClick={() => setIsMarketingAgreed(!isMarketingAgreed)}
              className="flex items-center gap-3 text-left cursor-pointer "
            >
              {isMarketingAgreed ? (
                <CheckSquare className="w-4 h-4 shrink-0 text-[#bef408]" />
              ) : (
                <Square className="w-4 h-4 text-[#666] shrink-0" />
              )}
              <span className="text-sm text-[#CCC]  leading-tight">
                {t.marketingAgree}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setModalType("marketing")}
              className="text-[13px] text-[#8E8E93] underline hover:text-white transition cursor-pointer shrink-0"
            >
              {t.viewLink}
            </button>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || completeAgreePending}
          className={`h-[52px] rounded-[10px] flex justify-center items-center mt-3 transition font-bold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isFormValid ? "bg-[#bef408] text-black" : "bg-[#333] text-[#666]"
          }`}
        >
          {completeAgreePending ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            t.startBtn
          )}
        </button>
      </div>

      {/* 약관 상세 모달 */}
      <TermsModal
        visible={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </main>
  );
}
