"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import TermsModal from "@/components/TermsModal";
import {
  FiChevronLeft,
  FiRefreshCw,
  FiSquare,
  FiCheckSquare,
} from "react-icons/fi";

const ADJECTIVES = [
  "귀여운",
  "다정한",
  "매력적인",
  "수줍은",
  "시크한",
  "상큼한",
  "풋풋한",
  "힙한",
  "자유로운",
  "러블리한",
  "즐거운",
];

const NOUNS = [
  "메이트",
  "스위티",
  "베이비",
  "뉴페이스",
  "큐티",
  "크루",
  "바이브",
  "브로",
  "시스터",
  "걸",
  "보이",
];

const generateRandomNickname = (): string => {
  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${randomAdj}${randomNoun}${randomNumber}`;
};

interface SignupData {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  isMarketingAgreed: boolean;
}

export default function SignupScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState(() => generateRandomNickname());

  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const handleRefreshNickname = () => {
    setNickname(generateRandomNickname());
  };

  const handleAllAgree = () => {
    const nextState = !(isTermsAgreed && isPrivacyAgreed && isMarketingAgreed);
    setIsTermsAgreed(nextState);
    setIsPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  const signupUser = async (signupData: SignupData) => {
    const { data } = await client.post("/auth/signup", signupData);
    return data;
  };

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      alert("회원가입이 완료되었습니다!");
      router.replace("/");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim().length < 5) {
      alert("아이디는 최소 5글자 이상이어야 합니다.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (nickname.trim().length < 2) {
      alert("닉네임은 최소 2글자 이상이어야 합니다.");
      return;
    }

    if (!isTermsAgreed) {
      alert("서비스 이용 약관에 동의해야 합니다.");
      return;
    }
    if (!isPrivacyAgreed) {
      alert("개인정보 처리 방침에 동의해야 합니다.");
      return;
    }

    signupMutate({
      email,
      password,
      passwordConfirm,
      nickname,
      isTermsAgreed,
      isPrivacyAgreed,
      isMarketingAgreed,
    });
  };

  const allChecked = isTermsAgreed && isPrivacyAgreed && isMarketingAgreed;

  return (
    <div className="flex min-h-screen justify-center bg-[#000000] px-4 py-8 text-white">
      <div className="w-full max-w-lg space-y-6">
        {/* 상단 헤더 */}
        <div className="flex items-center pb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer p-1 mr-2 text-white hover:bg-zinc-800 rounded-2xl transition"
          >
            <FiChevronLeft size={30} />
          </button>
          <h1 className="text-2xl font-bold">회원가입</h1>
        </div>

        {/* 입력 폼 영역 */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* 아이디 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              아이디
            </label>
            <input
              type="text"
              placeholder="최소 5자 이상 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              className="w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="영문 + 숫자 8자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              className="w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoCapitalize="none"
              className="w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          {/* 닉네임 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              닉네임
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="최소 2자 이상 입력"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoCapitalize="none"
                className="flex-1 h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
              />
              <button
                type="button"
                onClick={handleRefreshNickname}
                className="cursor-pointer h-14 px-4 bg-[#2C2C2E] rounded-xl flex items-center gap-1.5 hover:bg-[#3A3A3C] transition shrink-0"
              >
                <FiRefreshCw size={16} className="text-[#bef408]" />
                <span className=" text-sm font-bold text-[#bef408]">
                  랜덤 생성
                </span>
              </button>
            </div>
          </div>

          {/* 약관 동의 섹션 */}
          <div className="bg-[#1C1C1E] p-5 rounded-2xl mt-4 space-y-4">
            {/* 전체 동의 */}
            <button
              type="button"
              onClick={handleAllAgree}
              className="cursor-pointer flex items-center gap-3 w-full text-left"
            >
              {isTermsAgreed && isPrivacyAgreed ? (
                <FiCheckSquare size={22} className="text-[#bef408]" />
              ) : (
                <FiSquare size={22} className="text-[#8E8E93]" />
              )}
              <span className="text-base font-bold text-white">전체 동의</span>
            </button>

            <div className="h-[1px] bg-[#2C2C2E] my-2" />

            {/* 서비스 이용약관 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsTermsAgreed(!isTermsAgreed)}
                className="flex items-center gap-2.5 text-left"
              >
                <span
                  className={`cursor-pointer text-base ${isTermsAgreed ? "text-[#bef408] font-bold" : "text-[#666]"}`}
                >
                  {isTermsAgreed ? (
                    <FiCheckSquare size={18} className="text-[#bef408]" />
                  ) : (
                    <FiSquare size={18} className="text-[#8E8E93]" />
                  )}
                </span>
                <span className="text-sm text-[#DDD]">
                  [필수] 서비스 이용 약관 동의
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("terms")}
                className="cursor-pointer text-sm text-[#888] underline hover:text-white px-2 py-1"
              >
                보기
              </button>
            </div>

            {/* 개인정보 처리방침 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPrivacyAgreed(!isPrivacyAgreed)}
                className="flex items-center gap-2.5 text-left"
              >
                <span
                  className={`cursor-pointer text-base ${isPrivacyAgreed ? "text-[#bef408] font-bold" : "text-[#666]"}`}
                >
                  {isPrivacyAgreed ? (
                    <FiCheckSquare size={18} className="text-[#bef408]" />
                  ) : (
                    <FiSquare size={18} className="text-[#8E8E93]" />
                  )}
                </span>
                <span className="text-sm text-[#DDD]">
                  [필수] 개인정보 처리 방침 동의
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("privacy")}
                className="cursor-pointer text-sm text-[#888] underline hover:text-white px-2 py-1"
              >
                보기
              </button>
            </div>
          </div>

          {/* 가입하기 버튼 */}
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer w-full h-14 rounded-xl bg-[#bef408] font-bold text-lg text-gray-900 mt-6 hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "가입 중..." : "시작하기"}
          </button>
        </form>

        {/* 약관 상세 모달 연동 부분 */}
        <TermsModal
          visible={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      </div>
    </div>
  );
}
