import { GatheringDetailResponse } from "@/types/gathering/GatheringDetailResponse";
import { client } from "../client";

export const getGatheringDetail = async (
  id: string,
): Promise<GatheringDetailResponse> => {
  const { data } = await client.get(`/gathering/${id}`);
  return data;
};
