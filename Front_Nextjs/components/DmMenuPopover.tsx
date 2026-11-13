"use client";

import { useDmMenuPopoverLanguage } from "@/hooks/Languages/useDmMenuPopoverLanguage";
import React, { useEffect, useState } from "react";

interface DmMenuPopoverProps {
  partnerId: string;
  partnerName: string;
  avatarRef: React.RefObject<HTMLButtonElement | null>; // 💡 추가
  onClose: () => void;
  onNavigateProfile: (id: string) => void;
  onSendFriendRequest: (id: string) => void;
  onBlockUser: (id: string) => void;
}

export const DmMenuPopover = ({
  partnerId,
  partnerName,
  avatarRef,
  onClose,
  onNavigateProfile,
  onSendFriendRequest,
  onBlockUser,
}: DmMenuPopoverProps) => {
  const { t } = useDmMenuPopoverLanguage();
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // 💡 아바타 버튼의 화면상 절대 좌표를 계산하여 팝오버 위치 지정
  useEffect(() => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom, // 아바타 바로 아래 8px 간격
        left: rect.left + 20,
      });
    }
  }, [avatarRef]);

  return (
    <>
      {/* 배경 클릭 시 닫기 레이어 */}
      <div
        className="fixed inset-0 z-[9999]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* 팝오버 메뉴 박스 (fixed로 화면 최상단에 독립 렌더링) */}
      <div
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        className="fixed z-[10000] flex flex-col bg-[#2C2C2E] border border-white/15 rounded-2xl p-1.5 shadow-2xl w-36"
      >
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigateProfile(partnerId);
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t.menu.viewProfile}
        </button>

        <div className="h-[1px] bg-white/10 my-1 mx-1" />

        <button
          type="button"
          onClick={() => {
            onClose();
            onSendFriendRequest(partnerId);
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t.menu.friendRequest}
        </button>

        <div className="h-[1px] bg-white/10 my-1 mx-1" />

        <button
          type="button"
          onClick={() => {
            onClose();
            if (
              window.confirm(
                `${t.alerts.blockTitle}\n\n${t.alerts.blockConfirm(partnerName)}`,
              )
            ) {
              onBlockUser(partnerId || "");
            }
          }}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#FF5252] hover:bg-red-500/10 transition cursor-pointer"
        >
          {t.menu.block}
        </button>
      </div>
    </>
  );
};
