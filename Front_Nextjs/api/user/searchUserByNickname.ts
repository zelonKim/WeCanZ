import { client } from "@/api/client";

export const searchUserByNickname = async (nickname: string) => {
  const { data } = await client.get(
    `/user/search/${encodeURIComponent(nickname)}`,
  );
  return data;
};
