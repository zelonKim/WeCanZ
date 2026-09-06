"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { IoLockClosedOutline, IoPersonOutline } from "react-icons/io5";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "";

interface LoginData {
  email: string;
  password: string;
}

interface SocialLoginData {
  idToken: string;
  provider: "google" | "apple";
}

// 💡 useSearchParams()를 사용하는 핵심 로직 컴포넌트
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. 이메일 로그인 Mutation
  const loginUser = async (loginData: LoginData) => {
    const { data } = await client.post("/auth/login", loginData);
    return data;
  };

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data: any) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
        window.dispatchEvent(new Event("auth-state-change"));
      }
      router.replace("/");
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      let errorMessage = "오류가 발생했습니다.";

      if (errorData) {
        if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    },
  });

  // 2. 소셜 로그인 Mutation
  const socialLoginUser = async ({ idToken, provider }: SocialLoginData) => {
    const { data } = await client.post("/auth/social-login", {
      token: idToken,
      provider,
    });
    return data;
  };

  const { mutate: socialLoginMutate, isPending: isSocialPending } = useMutation(
    {
      mutationFn: socialLoginUser,
      onSuccess: async (data: any) => {
        if (data.accessToken) {
          await setAccessToken(data.accessToken);
          window.dispatchEvent(new Event("auth-state-change"));
        }
        if (data.isNewUser) {
          router.replace("/agreement");
        } else {
          router.replace("/");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          "소셜 로그인 중 오류가 발생했습니다.";
        alert(errorMessage);
      },
    },
  );

  // 이메일 로그인 제출 핸들러
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("아이디를 입력해 주세요.");
      return;
    }
    if (!password.trim()) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }
    loginMutate({ email, password });
  };

  // 애플 로그인 클릭 핸들러
  const handleAppleLogin = () => {
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      APPLE_REDIRECT_URI,
    )}&response_type=code id_token&scope=name email&response_mode=form_post`;

    window.location.href = appleAuthUrl;
  };

  useEffect(() => {
    const idToken = searchParams.get("id_token");
    if (idToken) {
      socialLoginMutate({ idToken, provider: "apple" });
    }
  }, [searchParams, socialLoginMutate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 py-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1C1C1E] p-8 pb-6 shadow-xl">
        {/* 1. 상단 로고 & 타이틀 */}
        <div className="text-center">
          <span className="text-4xl font-bold text-red-500">⚡️ 종태원</span>
          <p className="mt-2 text-[15px] text-[#A1A1A6] font-medium">
            오늘 밤, 가장 핫한 술번개 & 클럽번개
          </p>
        </div>

        {/* 2. 이메일 & 비밀번호 입력 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative flex items-center">
            <IoPersonOutline className="absolute left-4 text-neutral-400 text-xl pointer-events-none" />
            <input
              type="text"
              placeholder="아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 rounded-xl bg-[#2C2C2E] pl-12 pr-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-yellow-400"
              autoCapitalize="none"
            />
          </div>

          {/* 비밀번호 입력 영역 */}
          <div className="relative flex items-center">
            <IoLockClosedOutline className="absolute left-4 text-neutral-400 text-xl pointer-events-none" />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 rounded-xl bg-[#2C2C2E] pl-12 pr-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-yellow-400"
              autoCapitalize="none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isSocialPending}
            className="text-lg w-full h-14 rounded-xl bg-yellow-400 shadow-sm shadow-yellow-400 font-bold text-black transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "로그인 중...⚡️" : "로그인"}
          </button>
        </form>

        {/* 회원가입 이동 박스 */}
        <div className="flex justify-center items-center gap-2 text-sm">
          <span className="text-[#8E8E93]">아직 계정이 없으신가요?</span>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-semibold text-red-500 underline cursor-pointer hover:font-extrabold transition"
          >
            회원가입
          </button>
        </div>

        {/* 3. 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
          <span className="px-4 text-sm font-semibold text-[#666]">
            간편 로그인
          </span>
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
        </div>

        {/* 4. 하단 간편 소셜 로그인 */}
        <SocialLoginButtons
          onGoogleSuccess={(token) =>
            socialLoginMutate({ idToken: token, provider: "google" })
          }
          onAppleLogin={handleAppleLogin}
          isSocialPending={isSocialPending}
        />

        {/* 🚀 5. 약관, 스토어 배지 및 저작권 표기 영역 */}
        <div className="pt-6 border-t border-[#2C2C2E] text-center space-y-4">
          {/* 앱 출시 예정 안내 박스 */}
          <div className="bg-[#2C2C2E]/50 p-3 rounded-xl border border-[#3A3A3C]/50">
            <p className="text-sm font-medium text-[#A1A1A6] mb-2">
              ⚡️ 9월 중 앱 출시 예정
            </p>
            <div className="flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  alert("안드로이드 앱이 9월 중에 출시될 예정입니다! 📱")
                }
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Image
                  src="/logo/playStore.png"
                  alt="Get it on Google Play"
                  width={120}
                  height={36}
                  className="h-10 w-auto"
                />
              </button>

              <button
                type="button"
                onClick={() => alert("iOS 앱이 9월 중에 출시될 예정입니다! 📱")}
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Image
                  src="/logo/appStore.svg"
                  alt="Download on the App Store"
                  width={120}
                  height={36}
                  className="h-11.5 w-auto"
                />
              </button>
            </div>
          </div>

          {/* 하단 약관 및 저작권 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-center items-center gap-3 text-xs text-[#8E8E93]">
              <button
                type="button"
                onClick={() => router.push("/terms")}
                className="hover:text-white transition underline underline-offset-4 cursor-pointer"
              >
                서비스 이용약관
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => router.push("/privacy")}
                className="hover:text-white transition underline underline-offset-4 cursor-pointer"
              >
                개인정보 처리방침
              </button>
            </div>

            <p className="mt-2 text-[11px] text-[#555]">
              Copyright © 2026 Golazo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 💡 바깥쪽 최상위 컴포넌트에서 Suspense로 래핑하여 Vercel 프리렌더링 에러 차단
export default function LoginScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginContent />
      </GoogleOAuthProvider>
    </Suspense>
  );
}
