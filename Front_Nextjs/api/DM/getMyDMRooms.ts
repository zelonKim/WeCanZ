import { client } from "@/api/client";
import { DirectChatRoom } from "@/types/DM/DirectChatRoom";

export const getMyDMRooms = async (): Promise<DirectChatRoom[]> => {
  const { data } = await client.get("/direct-chat/rooms");
  return data;
};
