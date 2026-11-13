import { client } from "@/api/client";

export const requestFriendship = async (userId: string) => {
  const { data } = await client.post(`/friendship/request/${userId}`);
  return data;
};
