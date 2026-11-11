import { client } from "../client";

export const applyGathering = async (gatheringId: string) => {
  const { data } = await client.post(`/participant/apply/${gatheringId}`);
  return data;
};