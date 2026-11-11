import { DMRoomInfoResponse } from "@/types/DM/DMRoomInfoResponse";
import { client } from "../client";

export const getRoomInfo = async (
  roomId: string,
): Promise<DMRoomInfoResponse> => {
  const { data } = await client.get(`direct-chat/rooms/${roomId}`);
  return data;
};
