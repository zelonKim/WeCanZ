"use client";

import { useChatInputBarLanguage } from "@/hooks/Languages/useChatInputBarLanguage";
import { ArrowUp, Image as ImageIcon, X } from "lucide-react";
import React from "react";

interface ChatInputBarProps {
  isBlocked?: boolean;
  blockedText?: string;
  selectedImage: string | null;
  onRemoveImage: () => void;
  onImagePick: () => void;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  insetsBottom?: number; // 웹에서는 필수가 아니므로 옵셔널 처리
  placeholderText?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  isBlocked = false,
  blockedText,
  selectedImage,
  onRemoveImage,
  onImagePick,
  inputText,
  onChangeText,
  onSend,
  placeholderText,
}) => {
  const { t } = useChatInputBarLanguage();

  const finalBlockedText = blockedText || t.blockedText;
  const finalPlaceholder = placeholderText || t.placeholder;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((inputText.trim() || selectedImage) && !isBlocked) {
        onSend();
      }
    }
  };

  return (
    <div className="bg-[#1E1E1E] border-t border-[#2C2C2E] px-4 py-3 shrink-0">
      {isBlocked ? (
        <div className="h-10 bg-[#2C2C2E] rounded-full flex items-center justify-center">
          <span className="text-[#8E8E93] text-sm font-medium">
            {finalBlockedText}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* 선택된 이미지 미리보기 */}
          {selectedImage && (
            <div className="relative inline-flex items-center">
              <img
                src={selectedImage}
                alt="Upload Preview"
                className="w-16 h-16 rounded-lg object-cover border border-white/20"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-1.5 left-12 bg-black/70 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center border border-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 입력창 및 버튼 Row */}
          <div className="flex items-center gap-2">
            {/* 이미지 첨부 버튼 */}
            <button
              type="button"
              onClick={onImagePick}
              className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* 입력 캡슐 영역 */}
            <div className="flex-1 flex items-center bg-white/[0.06] border border-white/10 rounded-[24px] px-3.5 py-1.5 focus-within:ring-1 focus-within:ring-[#bef408]">
              <textarea
                value={inputText}
                onChange={(e) => onChangeText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={finalPlaceholder}
                rows={1}
                className="flex-1 bg-transparent text-white text-[15px] placeholder-[#8E8E93] focus:outline-none resize-none max-h-24 py-1.5 leading-snug"
              />

              {/* 전송 버튼 */}
              <button
                type="button"
                onClick={onSend}
                disabled={!inputText.trim() && !selectedImage}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition ml-2 shrink-0 ${
                  inputText.trim() || selectedImage
                    ? "bg-[#bef408] text-black hover:opacity-90 cursor-pointer"
                    : "bg-[#3A3A3C] text-[#525258] cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
