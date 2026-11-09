import { client } from "../client";

export const unblockUser = async (targetUserId: string): Promise<void> => {
  const { data } = await client.patch(`/friendship/unblock/${targetUserId}`);
  return data;
};
