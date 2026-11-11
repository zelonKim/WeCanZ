import { client } from "@/api/client";

export const cancelGathering = async (gatheringId: string) => {
  const { data } = await client.patch(`/gathering/${gatheringId}/cancel`);
  return data;
};
