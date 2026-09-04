"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useMutation } from "@tanstack/react-query";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { Suspense } from "react";

// 💡 환경변수 또는 발급받은 클라이언트 ID 입력
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

export default function LoginScreen() {
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
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 py-8">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1C1C1E] p-8 pb-4 shadow-xl">
            {/* 1. 상단 로고 & 타이틀 */}
            <div className="text-center">
              <span className="text-4xl font-bold text-red-500">⚡️ 종태원</span>
              <p className="mt-2 text-sm text-[#A1A1A6]">
                오늘 밤, 가장 핫한 술번개 & 클럽번개
              </p>
            </div>

            {/* 2. 이메일 & 비밀번호 입력 폼 */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="아이디"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 rounded-xl bg-[#2C2C2E] px-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-yellow-400"
                  autoCapitalize="none"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 rounded-xl bg-[#2C2C2E] px-4 text-white placeholder-[#666] outline-none focus:ring-2 focus:ring-yellow-400"
                  autoCapitalize="none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || isSocialPending}
                className="w-full h-14 rounded-xl bg-yellow-400 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "로그인 중..." : "로그인"}
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
              <span className="px-4 text-[13px] font-semibold text-[#666]">
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

            {/* 🚀 5. 약관 및 개인정보 처리방침 링크 추가 */}
            <div className="pt-4 border-t border-[#2C2C2E] text-center">
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
              <p className="text-[11px] text-[#666] mt-3">
                Copyright © 2026 Golazo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </Suspense>
  );
}
