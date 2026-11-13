import { client } from "@/api/client";

export const searchGatheringByCode = async (
  inviteCode: string,
): Promise<any> => {
  const { data } = await client.get(`/gathering/search/${inviteCode}`);
  return data;
};
