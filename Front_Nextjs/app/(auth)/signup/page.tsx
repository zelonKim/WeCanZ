"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import TermsModal from "@/components/TermsModal";
import {
  FiChevronLeft,
  FiRefreshCw,
  FiSquare,
  FiCheckSquare,
} from "react-icons/fi";
import { generateRandomNickname } from "@/utils/generateRandomNickname";
import { useSignupLanguage } from "@/hooks/Languages/useSignupLanguage";
import { useSignupMutation } from "@/hooks/auth/useSignupMutation";
import { SignupDto } from "@/types/auth/SignupDto";
import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";

export default function SignupScreen() {
  const { t, currentLang, nicknames } = useSignupLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState(() =>
    generateRandomNickname(nicknames, currentLang),
  );
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);
  const [modalType, setModalType] = useState<AgreementModalTypes | null>(null);

  //////////////////////////////////////////////////////////////////////////

  const handleRefreshNickname = () => {
    const otherNickname = generateRandomNickname(nicknames, currentLang);
    setNickname(otherNickname);
  };

  const handleAllAgree = () => {
    const nextState = !(isTermsAgreed && isPrivacyAgreed && isMarketingAgreed);
    setIsTermsAgreed(nextState);
    setIsPrivacyAgreed(nextState);
    setIsMarketingAgreed(nextState);
  };

  //////////////////////////////////////////////////////////////////////////

  const { mutate: signupMutate, isPending: signupPending } =
    useSignupMutation(t);

  const handleSignup = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (email.trim().length < 5) {
      alert(t.alerts.idMinLength);
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert(t.alerts.passwordRegex);
      return;
    }

    if (password !== passwordConfirm) {
      alert(t.alerts.passwordMismatch);
      return;
    }

    if (nickname.trim().length < 2) {
      alert(t.alerts.nicknameMinLength);
      return;
    }

    if (nickname.trim().length > 30) {
      alert(t.alerts.nicknameMaxLength);
      return;
    }

    if (!isTermsAgreed) {
      alert(t.alerts.termsRequiredAlert);
      return;
    }
    if (!isPrivacyAgreed) {
      alert(t.alerts.privacyRequiredAlert);
      return;
    }

    const signupPayload: SignupDto = {
      email,
      password,
      passwordConfirm,
      nickname,
      isTermsAgreed,
      isPrivacyAgreed,
      isMarketingAgreed,
    };

    signupMutate(signupPayload);
  };

  //////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex min-h-screen justify-center bg-[#121212] px-4 py-8 text-white">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center pb-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="cursor-pointer p-1 mr-2 text-white hover:bg-zinc-800 rounded-2xl transition"
          >
            <FiChevronLeft size={30} />
          </button>
          <h1 className="text-2xl font-bold text-[#bef408]">{t.headerTitle}</h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className=" text-sm font-semibold text-[#A1A1A6]">
              {t.idLabel}
            </label>
            <input
              type="text"
              placeholder={t.idPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              className="mt-1 w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              className="mt-1 w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              {t.passwordConfirmLabel}
            </label>
            <input
              type="password"
              placeholder={t.passwordConfirmPlaceholder}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoCapitalize="none"
              className="mt-1 w-full h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#A1A1A6]">
              {t.nicknameLabel}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder={t.nicknamePlaceholder}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoCapitalize="none"
                className="mt-1 flex-1 h-14 rounded-xl bg-[#1C1C1E] px-4 text-base text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
              />
              <button
                type="button"
                onClick={handleRefreshNickname}
                className="cursor-pointer h-14 px-4 bg-[#2C2C2E] rounded-xl flex items-center gap-1.5 hover:bg-[#3A3A3C] transition shrink-0"
              >
                <FiRefreshCw size={16} className="text-[#bef408]" />
                <span className="text-sm font-bold text-[#bef408]">
                  {t.refreshNickname}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-[#1C1C1E] p-5 rounded-2xl mt-4 space-y-4">
            <button
              type="button"
              onClick={handleAllAgree}
              className="cursor-pointer flex items-center gap-3 w-full text-left"
            >
              {isTermsAgreed && isPrivacyAgreed && isMarketingAgreed ? (
                <FiCheckSquare size={22} className="text-[#bef408]" />
              ) : (
                <FiSquare size={22} className="text-[#8E8E93]" />
              )}
              <span className="text-base font-bold text-white">
                {t.allAgree}
              </span>
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
                <span className="text-sm text-[#DDD]">{t.termsRequired}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("terms")}
                className="cursor-pointer text-sm text-[#888] underline hover:text-white px-2 py-1"
              >
                {t.viewLink}
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
                <span className="text-sm text-[#DDD]">{t.privacyRequired}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("privacy")}
                className="cursor-pointer text-sm text-[#888] underline hover:text-white px-2 py-1"
              >
                {t.viewLink}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsMarketingAgreed(!isMarketingAgreed)}
                className="flex items-center gap-2.5 text-left"
              >
                <span
                  className={`cursor-pointer text-base ${isMarketingAgreed ? "text-[#bef408] font-bold" : "text-[#666]"}`}
                >
                  {isMarketingAgreed ? (
                    <FiCheckSquare size={18} className="text-[#bef408]" />
                  ) : (
                    <FiSquare size={18} className="text-[#8E8E93]" />
                  )}
                </span>
                <span className="text-sm text-[#DDD]">
                  {t.marketingOptional}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalType("marketing")}
                className="cursor-pointer text-sm text-[#888] underline hover:text-white px-2 py-1"
              >
                {t.viewLink}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signupPending}
            className="cursor-pointer w-full h-14 rounded-xl bg-[#bef408] font-bold text-lg text-gray-900 my-4 hover:opacity-90 transition disabled:opacity-50"
          >
            {signupPending ? `${t.submitting}` : `${t.submitBtn}`}
          </button>
        </form>

        <TermsModal
          visible={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      </div>
    </div>
  );
}
