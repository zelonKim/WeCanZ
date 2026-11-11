import { client } from "@/api/client";

export const requestDM = async (targetUserId: string): Promise<any> => {
  const { data } = await client.post(`/direct-chat/request/${targetUserId}`);
  return data;
};
