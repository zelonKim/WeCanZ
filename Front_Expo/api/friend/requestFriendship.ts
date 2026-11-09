import { client } from "@/api/client";

export const requestFriendship = async (
  targetUserId: string,
): Promise<void> => {
  const { data } = await client.post(`/friendship/request/${targetUserId}`);
  return data;
};
