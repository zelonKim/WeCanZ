import { client } from "../client";

export const acceptDMRoom = async (roomId: string): Promise<void> => {
  const { data } = await client.patch(`/direct-chat/${roomId}/accept`);
  return data;
};
