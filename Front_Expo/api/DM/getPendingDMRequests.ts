import { client } from "@/api/client";
import { DirectChatRoom } from "@/types/DM/DirectChatRoom";

export const getPendingDMRequests = async (): Promise<DirectChatRoom[]> => {
  const { data } = await client.get("/direct-chat/requests/pending");
  return data;
};
