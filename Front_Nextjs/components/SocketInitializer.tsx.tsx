"use client";

import { useEffect, useState, useCallback } from "react";
import GlobalSocketListener from "@/components/GlobalSocketListener";
import { client } from "@/api/client";
import { useUnreadStore } from "@/stores/useUnreadStore";

export default function SocketInitializer() {
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [myGatheringIds, setMyGatheringIds] = useState<string[]>([]);

  const setUnreadGatherings = useUnreadStore(
    (state) => state.setUnreadGatherings,
  );

  const fetchMeAndGatherings = useCallback(async () => {
    try {
      // 1. 로그인 정보 및 unread 목록 조회
      const [meResponse, gatheringsResponse, unreadResponse] =
        await Promise.all([
          client.get("/user/me"),
          client.get("/gathering/my"),
          client.get("/gathering/unread"),
        ]);

      setMe(meResponse.data);

      // 2. 참여 모임 ID 배열 추출
      if (Array.isArray(gatheringsResponse.data)) {
        const ids = gatheringsResponse.data.map((g: { id: string }) => g.id);
        setMyGatheringIds(ids);
      }

      // 3. unread 스토어 동기화
      if (Array.isArray(unreadResponse.data)) {
        setUnreadGatherings(unreadResponse.data);
      }
    } catch (error) {
      console.error("소켓 데이터 로딩 실패:", error);
    }
  }, [setUnreadGatherings]);

  
  useEffect(() => {
    fetchMeAndGatherings();

    const handleAuthChange = () => fetchMeAndGatherings();
    // 💡 로그인/로그아웃 이벤트 발생 시 재조회 (커스텀 이벤트 또는 세션 스토리지 변경 감지)
    window.addEventListener("auth-state-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange);
    };
  }, [fetchMeAndGatherings]);

  // 💡 모임이 0개여도 로그인 유저라면 리스너를 켜두거나 unread 뱃지가 유지되도록 조건 완화
  if (!me?.id) return null;

  return (
    <GlobalSocketListener
      myGatheringIds={myGatheringIds}
      currentUserId={me.id}
    />
  );
}
