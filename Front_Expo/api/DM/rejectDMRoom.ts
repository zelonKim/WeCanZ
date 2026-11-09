import { client } from "../client";

export const rejectDMRoom = async (roomId: string): Promise<void> => {
  const { data } = await client.patch(`/direct-chat/${roomId}/reject`);
  return data;
};
