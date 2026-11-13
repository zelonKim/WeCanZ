"use client";

import { getMyFriends } from "@/api/friend/getMyFriends";
import { getPendingFriendRequests } from "@/api/friend/getPendingFriendRequests";
import { getBlockedUsers } from "@/api/user/getBlockedUsers";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { AddFriendModal } from "@/components/AddFriendModal";
import { BlockManagementModal } from "@/components/BlockManagementModal";
import { FriendItemRow } from "@/components/FriendItemRow";
import { PendingRequestsSection } from "@/components/PendingRequestsSection";
import { renderAvatar } from "@/components/renderAvatar";
import { useAcceptFriendMutation } from "@/hooks/friend/useAcceptFriendMutation";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useRejectFriendMutation } from "@/hooks/friend/useRejectFriendMutation";
import { useRequestFriendDmMutation } from "@/hooks/friend/useRequestFriendDmMutation";
import { useRequestFriendMutation } from "@/hooks/friend/useRequestFriendMutation";
import { useUnblockUserMutation } from "@/hooks/friend/useUnblockUserMutation";
import { useFriendLanguage } from "@/hooks/Languages/useFriendLanguage";
import { FriendItem } from "@/types/friend/FriendItem";
import { FriendshipRequest } from "@/types/friend/FriendshipRequest";
import { BlockedUserItem } from "@/types/user/BlockedUserItem";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, UserMinus, RefreshCw, Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function FriendPage() {
  const { t } = useFriendLanguage();

  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [friendNickname, setFriendNickname] = useState("");
  const [blockNickname, setBlockNickname] = useState("");

  const {
    data: pendingRequests = [],
    isPending: isWatingPending,
    refetch: refetchPending,
  } = useQuery<FriendshipRequest[]>({
    queryKey: ["friend-requests-pending"],
    queryFn: getPendingFriendRequests,
  });

  const {
    data: myFriends = [],
    isPending: isFriendsPending,
    refetch: refetchFriends,
  } = useQuery<FriendItem[]>({
    queryKey: ["my-friends"],
    queryFn: getMyFriends,
  });

  const {
    data: blockedUsers = [],
    isPending: isBlockedPending,
    refetch: refetchBlocked,
  } = useQuery<BlockedUserItem[]>({
    queryKey: ["blocked-users"],
    queryFn: getBlockedUsers,
    enabled: isBlockModalVisible,
  });

  const isRefreshing = isWatingPending || isFriendsPending;

  const onRefresh = () => {
    refetchPending();
    refetchFriends();
  };

  const { mutate: requestFriendMutate } = useRequestFriendMutation(t, () => {
    setIsAddModalVisible(false);
    setFriendNickname("");
  });

  const handleSendFriendRequest = async () => {
    if (!friendNickname.trim()) {
      alert(`${t.alerts.notice}: ${t.alerts.emptyNickname}`);
      return;
    }
    try {
      const userData = await searchUserByNickname(friendNickname.trim());
      requestFriendMutate(userData.id);
    } catch (error: any) {
      alert(`${t.alerts.notice}: ${t.alerts.searchFail}`);
    }
  };

  const { mutate: blockUserMutate } = useBlockUserMutation(() => {
    setBlockNickname("");
  });

  const handleBlockByNickname = async () => {
    if (!blockNickname.trim()) {
      alert(`${t.alerts.notice}: ${t.alerts.emptyBlockNickname}`);
      return;
    }
    try {
      const userData = await searchUserByNickname(blockNickname.trim());
      blockUserMutate(userData.id);
    } catch (error: any) {
      alert(`${t.alerts.notice}: ${t.alerts.searchFail}`);
    }
  };

  const { mutate: acceptFriendMutate } = useAcceptFriendMutation(t);
  const { mutate: rejectFriendMutate } = useRejectFriendMutation(t);
  const { mutate: requestFriendDmMutate } = useRequestFriendDmMutation(t);
  const { mutate: unblockMutate } = useUnblockUserMutation(t);

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#121212] shrink-0">
        <h1 className="text-2xl font-extrabold italic tracking-tight text-[#bef408]">
          {t.headerTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalVisible(true)}
            className="p-2 rounded-2xl hover:bg-white/10 transition cursor-pointer text-[#bef408]"
            title="친구 추가"
          >
            <UserPlus className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => setIsBlockModalVisible(true)}
            className="p-2 rounded-2xl hover:bg-white/10 transition cursor-pointer text-red-500"
            title="차단 관리"
          >
            <UserMinus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (스크롤) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* 대기 중인 친구 요청 섹션 */}
        <PendingRequestsSection
          pendingRequests={pendingRequests}
          t={t}
          renderAvatar={renderAvatar}
          onAccept={acceptFriendMutate}
          onReject={rejectFriendMutate}
        />

        {/* 친구 목록 헤더 */}
        <div className="mt-2 mb-1">
          <h2 className="text-base font-bold text-white">
            {t.roomsHeader(myFriends.length)}
          </h2>
        </div>

        {/* 친구 목록 렌더링 */}
        {isFriendsPending && myFriends.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#bef408]" />
          </div>
        ) : myFriends.length > 0 ? (
          <div className="flex flex-col gap-3">
            {myFriends.map((item) => (
              <FriendItemRow
                key={item.id}
                item={item}
                t={t}
                renderAvatar={renderAvatar}
                onRequestDm={(targetUserId, friend) =>
                  requestFriendDmMutate({ targetUserId, friend })
                }
                onBlockUser={unblockMutate}
              />
            ))}
          </div>
        ) : (
          /* 빈 친구 목록 카드 */
          <div className="p-6 items-center justify-center bg-zinc-900 border border-white/5 rounded-2xl text-center">
            <span className="text-sm text-zinc-400">{t.emptyFriends}</span>
          </div>
        )}
      </div>

      {/* 친구 추가 모달 */}
      <AddFriendModal
        visible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          setFriendNickname("");
        }}
        friendNickname={friendNickname}
        setFriendNickname={setFriendNickname}
        onSubmit={handleSendFriendRequest}
        t={t}
      />

      {/* 차단 관리 모달 */}
      <BlockManagementModal
        visible={isBlockModalVisible}
        onClose={() => setIsBlockModalVisible(false)}
        blockNickname={blockNickname}
        setBlockNickname={setBlockNickname}
        onBlockSubmit={handleBlockByNickname}
        blockedUsers={blockedUsers}
        isBlockedLoading={isBlockedPending}
        onRefreshBlocked={refetchBlocked}
        onUnblock={(targetUserId) => unblockMutate(targetUserId)}
        renderAvatar={renderAvatar}
        t={t}
      />
    </div>
  );
}
