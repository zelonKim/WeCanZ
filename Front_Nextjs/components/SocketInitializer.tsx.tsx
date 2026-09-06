"use client";

import { useEffect, useState } from "react";
import GlobalSocketListener from "@/components/GlobalSocketListener";
import { client } from "@/api/client";
import { useUnreadStore } from "@/stores/useUnreadStore";

export default function SocketInitializer() {
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [myGatheringIds, setMyGatheringIds] = useState<string[]>([]);

  const setUnreadGatherings = useUnreadStore(
    (state) => state.setUnreadGatherings,
  );

  useEffect(() => {
    const fetchMeAndGatherings = async () => {
      try {
        // 1. axios client를 통한 내 정보 및 참여 모임 조회
        const [meResponse, gatheringsResponse, unreadResponse] =
          await Promise.all([
            client.get("/user/me"),
            client.get("/gathering/my"),
            client.get("/gathering/unread"),
          ]);

        setMe(meResponse.data);

        // 2. 모임 ID 배열 추출
        if (Array.isArray(gatheringsResponse.data)) {
          const ids = gatheringsResponse.data.map((g: { id: string }) => g.id);
          setMyGatheringIds(ids);
        }

        if (Array.isArray(unreadResponse.data)) {
          setUnreadGatherings(unreadResponse.data);
        }
      } catch (error) {
        // 인증 실패 등의 에러는 client.interceptors에서 자동 처리됨
        console.error("소켓 데이터 로딩 실패:", error);
      }
    };

    fetchMeAndGatherings();
  }, [setUnreadGatherings]);

  if (!me?.id || myGatheringIds.length === 0) return null;

  return (
    <GlobalSocketListener
      myGatheringIds={myGatheringIds}
      currentUserId={me.id}
    />
  );
}
