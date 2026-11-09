import { client } from "../client";

export const leaveDMRoom = async (roomId: string): Promise<void> => {
  const { data } = await client.delete(`/direct-chat/rooms/${roomId}/leave`);
  return data;
};
