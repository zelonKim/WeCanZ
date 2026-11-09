import { client } from "@/api/client";
import { BlockedUserItem } from "@/types/user/BlockedUserItem";

export const getBlockedUsers = async (): Promise<BlockedUserItem[]> => {
  const { data } = await client.get("/friendship/blocked");
  return data;
};
