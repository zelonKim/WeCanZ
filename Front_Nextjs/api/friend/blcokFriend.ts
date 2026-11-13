import { client } from "../client";

export const blockFriend = async (targetUserId: string) => {
  const { data } = await client.patch(`/friendship/block/${targetUserId}`);
  return data;
};