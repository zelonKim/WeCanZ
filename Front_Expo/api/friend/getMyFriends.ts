import { client } from "@/api/client";
import { FriendItem } from "@/types/friend/FriendItem";

export const getMyFriends = async (): Promise<FriendItem[]> => {
  const { data } = await client.get("/friendship");
  return data.filter((item: FriendItem) => item.status === "ACCEPTED");
};
