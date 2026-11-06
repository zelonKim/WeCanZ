"use client";

import { client } from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  PersonOutline,
  PersonAddOutline,
  PersonRemoveOutline,
  ChatbubblesOutline,
  CloseOutline,
  Person,
} from "react-ionicons";

interface User {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface FriendshipRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";
  sender: User;
}

interface FriendItem {
  id: string;
  friendUser: User;
}

interface BlockedUserItem {
  id: string;
  receiver?: User;
  nickname?: string;
  profileImage?: string;
}

export default function FriendScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [friendNickname, setFriendNickname] = useState("");
  const [blockNickname, setBlockNickname] = useState("");

  // 1. 받은 친구 요청 목록 조회
  const {
    data: pendingRequests = [],
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery<FriendshipRequest[]>({
    queryKey: ["friend-requests-pending"],
    queryFn: async () => {
      const { data } = await client.get("/friendship/requests/pending");
      return data;
    },
  });

  // 2. 내 친구 목록 조회
  const {
    data: myFriends = [],
    isLoading: isFriendsLoading,
    refetch: refetchFriends,
  } = useQuery<FriendItem[]>({
    queryKey: ["my-friends"],
    queryFn: async () => {
      const { data } = await client.get("/friendship");
      return data;
    },
  });

  // 3. 내가 차단한 유저 목록 조회 (모달 오픈 시 실행)
  const {
    data: blockedUsers = [],
    isLoading: isBlockedLoading,
    refetch: refetchBlocked,
  } = useQuery<BlockedUserItem[]>({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const { data } = await client.get("/friendship/blocked");
      return data;
    },
    enabled: isBlockModalVisible,
  });

  // 4. 친구 요청 수락
  const acceptMutation = useMutation({
    mutationFn: (friendshipId: string) =>
      client.patch(`/friendship/${friendshipId}/accept`),
    onSuccess: () => {
      alert("친구 요청을 수락했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "수락에 실패했습니다.");
    },
  });

  // 5. 친구 요청 거절
  const rejectMutation = useMutation({
    mutationFn: (friendshipId: string) =>
      client.patch(`/friendship/${friendshipId}/reject`),
    onSuccess: () => {
      alert("친구 요청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["friend-requests-pending"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "거절에 실패했습니다.");
    },
  });

  // 6. 친구 신청
  const handleSendFriendRequest = async () => {
    if (!friendNickname.trim()) {
      alert("친구의 닉네임을 입력해주세요");
      return;
    }

    try {
      const res = await client.get(
        `/user/search/${encodeURIComponent(friendNickname.trim())}`,
      );
      await client.post(`/friendship/request/${res.data.id}`);

      setIsAddModalVisible(false);
      setFriendNickname("");
      alert("친구 요청을 보냈습니다.");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "오류로 인해 친구 요청에 실패했습니다.";
      alert(errorMessage);
    }
  };

  // 7. DM 요청 Mutation
  const requestDmMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      friend,
    }: {
      targetUserId: string;
      friend: User;
    }) => {
      const response = await client.post(
        `/direct-chat/request/${targetUserId}`,
      );
      return { roomData: response.data, friend };
    },
    onSuccess: ({ roomData, friend }) => {
      const chatRoomId = roomData.id;
      router.push(
        `/dm/${chatRoomId}?name=${encodeURIComponent(friend.nickname)}&profileImage=${encodeURIComponent(friend.profileImage || "")}`,
      );
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "DM 이동에 실패했습니다.");
    },
  });

  // 8. 차단 해제 Mutation
  const unblockMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.patch(`/friendship/unblock/${targetUserId}`),
    onSuccess: () => {
      alert("차단이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "차단 해제 실패");
    },
  });

  // 9. 유저 차단 Mutation
  const blockUserMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      client.patch(`/friendship/block/${targetUserId}`),
    onSuccess: () => {
      alert("유저를 차단했습니다.");
      setBlockNickname("");
      queryClient.invalidateQueries({ queryKey: ["my-friends"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "유저 차단에 실패했습니다.");
    },
  });

  // 10. 닉네임으로 검색해서 직접 차단하기
  const handleBlockByNickname = async () => {
    if (!blockNickname.trim()) {
      alert("차단할 유저의 닉네임을 입력해주세요.");
      return;
    }

    try {
      const res = await client.get(
        `/user/search/${encodeURIComponent(blockNickname.trim())}`,
      );
      blockUserMutation.mutate(res.data.id);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "존재하지 않거나 검색할 수 없는 유저입니다.";
      alert(errorMessage);
    }
  };

  const renderAvatar = (profileImage?: string) => {
    if (profileImage) {
      return (
        <img
          src={profileImage}
          alt="avatar"
          className="w-11 h-11 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center">
        <Person color="#8E8E93" height="22px" width="22px" />
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen  text-white max-w-5xl mx-auto px-4 py-1">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between py-3 border-b border-zinc-800 mb-4">
        <h1 className="text-[28px] text-[#bef408] font-bold italic">
          Z-Friend
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalVisible(true)}
            className="p-2 hover:bg-zinc-800 rounded-2xl transition cursor-pointer"
          >
            <PersonAddOutline color="#bef408" height="24px" width="24px" />
          </button>
          <button
            onClick={() => setIsBlockModalVisible(true)}
            className="p-2 hover:bg-zinc-800 rounded-2xl transition cursor-pointer"
          >
            <PersonRemoveOutline color="#EF4444" height="24px" width="24px" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="space-y-6 pb-20">
        {/* 받은 친구 요청 섹션 */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            받은 친구 요청 ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center text-zinc-400 text-base">
              받은 친구 요청이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {renderAvatar(req.sender?.profileImage)}
                    <span className="font-semibold text-white text-base">
                      {req.sender?.nickname || "알 수 없는 유저"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(req.id)}
                      className="cursor-pointer bg-blue-600 px-3.5 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90 transition"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(req.id)}
                      className="cursor-pointer bg-zinc-800 px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 친구 목록 섹션 */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            친구 목록 ({myFriends.length})
          </h2>

          {myFriends.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-base">
              아직 등록된 친구가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myFriends.map((item) => {
                const friend = item.friendUser || (item as any);
                const targetUserId = friend.id || item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(friend.profileImage)}
                      <span className="font-semibold text-white text-base">
                        {friend.nickname}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          requestDmMutation.mutate({ targetUserId, friend })
                        }
                        className="cursor-pointer p-2 bg-[#bef408] rounded-xl hover:opacity-90 transition"
                        title="DM 보내기"
                      >
                        <ChatbubblesOutline
                          color="#000000"
                          height="20px"
                          width="20px"
                        />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            confirm(`${friend.nickname}님을 차단하시겠습니까?`)
                          ) {
                            blockUserMutation.mutate(targetUserId);
                          }
                        }}
                        className="cursor-pointer p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition"
                        title="차단하기"
                      >
                        <PersonRemoveOutline
                          color="#EF4444"
                          height="20px"
                          width="20px"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 친구 추가 모달 */}
      {isAddModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-center mb-1">👋 친구 추가</h3>
            <p className="text-sm text-zinc-400 text-center mb-5">
              추가할 친구의 닉네임을 입력해주세요.
            </p>

            <input
              type="text"
              placeholder="닉네임 입력"
              value={friendNickname}
              onChange={(e) => setFriendNickname(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-[#bef408] mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAddModalVisible(false);
                  setFriendNickname("");
                }}
                className="cursor-pointer flex-1 bg-zinc-800 py-3 rounded-xl font-bold text-[15px] text-zinc-300 hover:bg-zinc-700 transition"
              >
                취소
              </button>
              <button
                onClick={handleSendFriendRequest}
                className="cursor-pointer flex-1 bg-[#bef408] hover:bg-[#bef408]/80 py-3 rounded-xl font-bold text-[15px] text-black hover:opacity-90 transition"
              >
                요청 보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 차단 관리 모달 */}
      {isBlockModalVisible && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setIsBlockModalVisible(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <h3 className="text-lg font-bold">🚫 차단 관리</h3>
              <button onClick={() => setIsBlockModalVisible(false)}>
                <CloseOutline color="#8E8E93" height="24px" width="24px" />
              </button>
            </div>

            {/* 닉네임 입력 차단 영역 */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="닉네임 입력"
                value={blockNickname}
                onChange={(e) => setBlockNickname(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-[15px] text-white outline-none focus:border-red-500"
              />
              <button
                onClick={handleBlockByNickname}
                className="bg-red-500 px-5 rounded-xl font-bold text-[15px] text-white hover:opacity-90 transition"
              >
                차단 하기
              </button>
            </div>

            <h4 className="text-[15px] font-semibold text-zinc-400 mb-3">
              차단된 친구 목록 ({blockedUsers.length})
            </h4>

            {/* 차단 유저 목록 리스트 */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {blockedUsers.length === 0 ? (
                <div className="bg-zinc-800/50 p-6 rounded-xl text-center text-zinc-500 text-sm">
                  차단한 유저가 없습니다.
                </div>
              ) : (
                blockedUsers.map((item) => {
                  const user = item.receiver || (item as any);
                  const targetUserId = user.id || item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-800/60 border border-zinc-700/50 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {renderAvatar(user.profileImage)}
                        <span className="font-semibold text-white text-sm">
                          {user.nickname || "알 수 없음"}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `${user.nickname || "알 수 없음"}님을 차단 해제하시겠습니까?`,
                            )
                          ) {
                            unblockMutation.mutate(targetUserId);
                          }
                        }}
                        className="bg-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-200 hover:bg-zinc-600 transition"
                      >
                        차단 해제
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
