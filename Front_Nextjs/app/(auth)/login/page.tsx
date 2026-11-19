"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { IoLockClosedOutline, IoPersonOutline } from "react-icons/io5";
import { LoginDto } from "@/types/auth/LoginDto";
import { useLoginLanguage } from "@/hooks/Languages/useLoginLanguage";
import { useEmailLoginMutation } from "@/hooks/auth/useEmailLoginMutation";
import { useSocialLoginMutation } from "@/hooks/auth/useSocialLoginMutation";
import { handleAppleLogin } from "@/utils/handleAppleLogin";
import { handleAppDownload } from "@/utils/handleAppDownload";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

function LoginContent() {
  const { t } = useLoginLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  ///////////////////////////////////////////////////////////////////////////

  const { mutate: loginMutate, isPending: loginPending } =
    useEmailLoginMutation(t);

  const handleEmailLogin = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert(t.alerts.idRequired);
      return;
    }

    if (!password.trim()) {
      alert(t.alerts.pwRequired);
      return;
    }

    const loginPayload: LoginDto = { email, password };

    loginMutate(loginPayload);
  };

  ///////////////////////////////////////////////////////////////////////////

  const { mutate: socialLoginMutate, isPending: socialLoginPending } =
    useSocialLoginMutation(t);

  ///////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const idToken = searchParams.get("id_token");
    if (idToken) {
      socialLoginMutate({ idToken, provider: "apple" });
    }
  }, [searchParams, socialLoginMutate]);

  ///////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 py-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl   bg-[#1C1C1E] p-8 pb-6 ">
        <div className="flex flex-col items-center">
          <Image
            src="/logo/sticker.png"
            alt="WeCanZ_sticker"
            width={90}
            height={90}
          />
          <span className="mt-2 text-4xl font-bold italic text-[#bef408]">
            WeCanZ
          </span>

          <p className="mt-1 text-[15px] text-[#A1A1A6] font-medium text-center">
            {t.subText}
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative flex items-center">
            <IoPersonOutline className="absolute left-4 text-neutral-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder={t.idPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 rounded-xl bg-[#2C2C2E] pl-12 pr-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
              autoCapitalize="none"
            />
          </div>

          <div className="relative flex items-center">
            <IoLockClosedOutline className="absolute left-4 text-neutral-400 text-xl pointer-events-none" />
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 rounded-xl bg-[#2C2C2E] pl-12 pr-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-[#bef408]"
              autoCapitalize="none"
            />
          </div>

          <button
            type="submit"
            disabled={loginPending || socialLoginPending}
            className="text-lg w-full h-14 rounded-xl bg-[#bef408] shadow-sm shadow-green-500 font-bold text-black transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {loginPending ? `${t.waitLogin}` : `${t.loginBtn}`}
          </button>
        </form>

        <div className="flex justify-center items-center gap-2 text-sm">
          <span className="text-[#8E8E93]">{t.signupPrompt}</span>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-semibold text-[#bef408] hover:underline cursor-pointer hover:font-black transition"
          >
            {t.signupLink}
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
          <span className="px-4 text-sm font-semibold text-[#666]">
            {t.dividerText}
          </span>
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
        </div>

        <SocialLoginButtons
          onGoogleSuccess={(token) =>
            socialLoginMutate({ idToken: token, provider: "google" })
          }
          onAppleLogin={handleAppleLogin}
          isSocialPending={socialLoginPending}
        />

        <div className="pt-6 border-t border-[#2C2C2E] text-center space-y-4">
          <div className="bg-[#2C2C2E]/50 pb-5 pt-3 rounded-xl border border-[#3A3A3C]/50">
            <p className="text-[13px] font-medium text-[#A1A1A6] mb-2">
              {t.downloadApp}
            </p>
            <div className="flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleAppDownload(
                    "https://play.google.com/store/apps/details?id=com.zelon.wecanz",
                  )
                }
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Image
                  src="/logo/playStore.png"
                  alt="Get it on Google Play"
                  width={120}
                  height={36}
                  className="h-11 w-36"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAppDownload(
                    "https://apps.apple.com/us/app/wecanz/id6834660604",
                  )
                }
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Image
                  src="/logo/appStore.svg"
                  alt="Download on the App Store"
                  width={120}
                  height={36}
                  className="h-11 w-36"
                />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-center items-center gap-3 text-xs text-[#8E8E93]">
              <button
                type="button"
                onClick={() => router.push("/terms")}
                className="hover:text-white hover:font-medium transition underline underline-offset-4 cursor-pointer"
              >
                {t.termsOfService}
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => router.push("/privacy")}
                className="hover:text-white hover:font-medium transition underline underline-offset-4 cursor-pointer"
              >
                {t.privacyPolicy}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-[#555]">
              Copyright © 2026 WeCanZ. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginContent />
      </GoogleOAuthProvider>
    </Suspense>
  );
}
