import { DirectChatMessage } from "@/types/DM/DirectChatMessage";
import { client } from "../client";

export const getDmMessages = async (
  roomId: string,
): Promise<DirectChatMessage[]> => {
  const { data } = await client.get<DirectChatMessage[]>(
    `/direct-chat/rooms/${roomId}/messages`,
  );
  return data;
};