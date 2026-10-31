"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IoCheckbox,
  IoSquareOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
} from "react-icons/io5";

// API 클라이언트 및 모달 컴포넌트 (프로젝트 환경에 맞게 경로 확인)
import { client } from "@/api/client";
import TermsModal from "@/components/TermsModal";
import Image from "next/image";

export default function AgreementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [nickname, setNickname] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // 약관 모달 상태 관리 ('terms' | 'privacy' | null)
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  // 유저 정보 조회
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await client.get("/user/me");
      return data;
    },
  });

  useEffect(() => {
    if (me?.nickname) {
      setNickname(me.nickname);
    }
  }, [me]);

  // 전체 동의 상태 토글
  const handleAllAgree = () => {
    const nextState = !(termsAgreed && privacyAgreed);
    setTermsAgreed(nextState);
    setPrivacyAgreed(nextState);
  };

  // 회원가입 최종 완료 및 약관 동의 업데이트 API 호출
  const updateAgreementAndNickname = async () => {
    const { data } = await client.patch("/user/profile", {
      nickname,
      termsAgreedAt: new Date().toISOString(),
      privacyAgreedAt: new Date().toISOString(),
    });
    return data;
  };

  const { mutate: completeMutate, isPending } = useMutation({
    mutationFn: updateAgreementAndNickname,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : message;
      alert(displayMessage || "처리 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert("사용하실 닉네임을 입력해 주세요.");
      return;
    }
    if (!termsAgreed || !privacyAgreed) {
      alert("필수 약관에 모두 동의해 주세요.");
      return;
    }
    completeMutate();
  };

  const isFormValid =
    nickname.trim().length > 0 && termsAgreed && privacyAgreed;

  return (
    <div className="flex min-h-screen w-full items-start justify-center pt-32  bg-[#121212] px-6 text-white">
      <div className="w-full max-w-md space-y-6">
        {/* 헤더 타이틀 */}
        <div>
          <div className="flex flex-row items-end gap-2">
            <h1 className="text-2xl italic font-bold text-[#bef408]">
              거의 다 완료됐어요
            </h1>
            <Image
              src="/logo/sticker.png"
              alt="WeCanZ_sticker"
              width={40}
              height={40}
            />
          </div>
          <p className="mt-2 text-[15px] text-neutral-400">
            서비스 이용을 위해서는 닉네임과 유저 동의가 필요해요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              닉네임
            </label>
            <input
              type="text"
              placeholder="최소 2자 이상 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              className="h-13 w-full rounded-xl bg-[#1C1C1E] px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#bef408]"
            />
          </div>

          {/* 약관 동의 영역 */}
          <div className="space-y-3.5 rounded-xl bg-[#1C1C1E] p-4">
            {/* 전체 동의하기 */}
            <button
              type="button"
              onClick={handleAllAgree}
              className="cursor-pointer flex items-center gap-3 text-left w-full"
            >
              {termsAgreed && privacyAgreed ? (
                <IoCheckbox size={20} className="text-[#bef408]" />
              ) : (
                <IoSquareOutline size={20} className="text-neutral-500" />
              )}
              <span className="text-base font-bold text-white ">
                전체 동의하기
              </span>
            </button>

            <div className="h-px w-full bg-[#2C2C2E]" />

            {/* 서비스 이용약관 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTermsAgreed(!termsAgreed)}
                className="cursor-pointer flex items-center gap-3 text-left"
              >
                {termsAgreed ? (
                  <IoCheckmarkCircle size={20} className="text-[#bef408]" />
                ) : (
                  <IoEllipseOutline size={20} className="text-neutral-500" />
                )}
                <span className="text-sm text-neutral-300">
                  [필수] 서비스 이용약관 동의
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("terms")}
                className="cursor-pointer text-xs text-neutral-400 underline hover:text-white"
              >
                보기
              </button>
            </div>

            {/* 개인정보 처리방침 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPrivacyAgreed(!privacyAgreed)}
                className="cursor-pointer flex items-center gap-3 text-left"
              >
                {privacyAgreed ? (
                  <IoCheckmarkCircle size={20} className="text-[#bef408]" />
                ) : (
                  <IoEllipseOutline size={20} className="text-neutral-500" />
                )}
                <span className="text-sm text-neutral-300">
                  [필수] 개인정보 처리방침 동의
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("privacy")}
                className="cursor-pointer text-xs text-neutral-400 underline hover:text-white"
              >
                보기
              </button>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className={`flex h-13 w-full items-center justify-center rounded-xl text-base font-bold transition ${
              isFormValid
                ? "bg-[#bef408] text-neutral-900 hover:opacity-80 cursor-pointer"
                : "bg-[#333333] text-neutral-500 cursor-not-allowed"
            }`}
          >
            {isPending ? (
              <div className="animate-spin text-4xl">
                <Image
                  src="/logo/sticker.png"
                  alt="WeCanZ_sticker"
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              "시작하기"
            )}
          </button>
        </form>
      </div>

      {/* 약관 및 개인정보 처리방침 모달 컴포넌트 */}
      {modalType && (
        <TermsModal
          visible={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
