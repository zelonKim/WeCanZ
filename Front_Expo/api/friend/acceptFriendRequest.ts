import { client } from "../client";

export const acceptFriendRequest = async (
  friendshipId: string,
): Promise<void> => {
  const { data } = await client.patch(`/friendship/${friendshipId}/accept`);
  return data;
};
