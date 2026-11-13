import { client } from "@/api/client";

export const rejectFriendRequest = async (
  friendshipId: string,
): Promise<void> => {
  const { data } = await client.patch(`/friendship/${friendshipId}/reject`);
  return data;
};
