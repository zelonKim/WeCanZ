import { client } from "@/api/client";

export const startGathering = async (gatheringId: string) => {
  const { data } = await client.patch(`/gathering/${gatheringId}/start`);
  return data;
};
