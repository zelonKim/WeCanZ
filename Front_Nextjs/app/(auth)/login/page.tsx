"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();

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
      router.replace("/"); // 웹 라우팅 경로에 맞게 수정
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

      alert(errorMessage); // 웹용 알림
    },
  });

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

  // 💡 웹 환경 구글 로그인 핸들러 (Google Identity Services 혹은 NextAuth 권장)
  const handleGoogleLogin = () => {
    alert(
      "웹용 구글 로그인은 Google OAuth SDK 또는 NextAuth를 연동해야 합니다.",
    );
  };

  // 💡 웹 환경 애플 로그인 핸들러 (Apple JS SDK 연동 필요)
  const handleAppleLogin = () => {
    alert("웹용 애플 로그인은 Apple JS SDK를 연동해야 합니다.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1C1C1E] p-8 shadow-xl">
        {/* 1. 상단 로고 & 타이틀 */}
        <div className="text-center">
          <span className="text-4xl font-bold text-red-500">⚡️</span>
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
            disabled={isPending}
            className="w-full h-14 rounded-xl bg-yellow-400 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 회원가입 이동 박스 */}
        <div className="flex justify-center items-center gap-2 text-sm">
          <span className="text-[#8E8E93]">아직 계정이 없으신가요?</span>
          <button
            onClick={() => router.push("/signup")}
            className="font-semibold text-red-500 underline cursor-pointer hover:font-extrabold transition"
          >
            회원가입
          </button>
        </div>

        {/* 3. 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
          <span className="px-4 text-xs text-[#666]">간편 로그인</span>
          <div className="flex-1 h-[1px] bg-[#2C2C2E]" />
        </div>

        {/* 4. 하단 간편 소셜 로그인 */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            구글로 시작하기
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full h-12 rounded-xl bg-black text-white border border-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition"
          >
            Apple로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
