import { client } from "../client";

export const cancelApplyGathering = async (gatheringId: string) => {
  const { data } = await client.delete(`/participant/cancel/${gatheringId}`);
  return data;
};
