"use client";

import { ChevronLeft, User, AlertTriangle } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  avatarUri?: string | null;
  avatarRef?: React.RefObject<HTMLButtonElement | null>; // 💡 추가
  onAvatarPress?: () => void;
  onReportPress: () => void;
  children?: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onBack,
  title,
  subtitle,
  avatarUri,
  avatarRef, // 💡 추가
  onAvatarPress,
  onReportPress,
  children,
}) => {
  return (
    <header className="relative h-14 flex items-center justify-between px-4 bg-[#1E1E1E] border-b border-[#2C2C2E] shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="w-10 flex items-start justify-center text-white hover:opacity-75 transition cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="absolute left-12 right-12 flex items-center justify-center gap-2 pointer-events-none">
        {onAvatarPress ? (
          <button
            type="button"
            ref={avatarRef} // 💡 아바타 버튼에 ref 연결
            onClick={onAvatarPress}
            className="relative rounded-full overflow-hidden pointer-events-auto hover:opacity-80 transition cursor-pointer shrink-0"
          >
            {avatarUri ? (
              <img
                src={avatarUri}
                alt={title}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white">
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            )}
          </button>
        ) : null}
        {children} {/* 여기에 DmMenuPopover가 렌더링됨 */}
        <div className="flex flex-col items-center min-w-0">
          <h1 className="text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-md text-center">
            {title}
          </h1>
          {subtitle && (
            <span className="text-[11px] text-[#8E8E93] mt-0.5 truncate max-w-[220px] sm:max-w-md text-center">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onReportPress}
        className="w-10 flex items-end justify-center text-[#FF453A] hover:opacity-75 transition cursor-pointer"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>
    </header>
  );
};
