"use client";

import { MyInfo } from "@/types/user/MyInfo";
import { formatTime } from "@/utils/formatTime";
import React from "react";

interface ChatMessageItemProps {
  item: any;
  myInfo?: MyInfo;
  onDeleteMessage: (item: any) => void;
  onOpenImageModal: (uri: string) => void;
}

export const DirectChatMessageItem = ({
  item,
  myInfo,
  onDeleteMessage,
  onOpenImageModal,
}: ChatMessageItemProps) => {
  const isMyMessage =
    (item.senderId && item.senderId === myInfo?.id) ||
    (item.sender?.id && item.sender.id === myInfo?.id);

  // 웹에서 우클릭 시 삭제 메뉴 실행 (모바일의 onLongPress 대체)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onDeleteMessage(item);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      className={`flex flex-col my-1 max-w-[75%] ${
        isMyMessage ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <div className="flex items-end gap-1.5">
        {/* 내 메시지 타임스탬프 */}
        {isMyMessage && (
          <span className="text-[10px] text-zinc-500 mb-0.5 shrink-0">
            {formatTime(item.createdAt)}
          </span>
        )}

        {/* 메시지 콘텐츠 컨테이너 */}
        <div
          className={`flex flex-col ${
            isMyMessage ? "items-end" : "items-start"
          } max-w-full`}
        >
          {/* 이미지 첨부 */}
          {item.imageUrl && (
            <div className="mb-1.5">
              <img
                src={item.imageUrl}
                alt="Chat Attachment"
                onClick={() => onOpenImageModal(item.imageUrl)}
                className={`rounded-xl object-cover cursor-pointer hover:opacity-95 transition ${
                  !item.message ? "w-40 h-40" : "w-40 h-40"
                }`}
              />
            </div>
          )}

          {/* 텍스트 메시지 뷰 */}
          {item.message ? (
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words ${
                isMyMessage
                  ? "bg-[#bef408] text-black font-medium rounded-br-sm"
                  : "bg-[#2C2C2E] text-[#F2F2F7] rounded-bl-sm border border-white/5"
              }`}
            >
              {item.message}
            </div>
          ) : null}
        </div>

        {/* 상대방 메시지 타임스탬프 */}
        {!isMyMessage && (
          <span className="text-[10px] text-zinc-500 mb-0.5 shrink-0">
            {formatTime(item.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};
