import { client } from "@/api/client";
import { FriendshipRequest } from "@/types/friend/FriendshipRequest";

export const getPendingFriendRequests = async (): Promise<
  FriendshipRequest[]
> => {
  const { data } = await client.get("/friendship/requests/pending");
  return data;
};
