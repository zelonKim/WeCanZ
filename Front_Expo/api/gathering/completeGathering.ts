import { client } from "@/api/client";

export const completeGathering = async (gatheringId: string) => {
  const { data } = await client.patch(`/gathering/${gatheringId}/complete`);
  return data;
};
