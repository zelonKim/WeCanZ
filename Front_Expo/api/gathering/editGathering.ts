import { EditGatheringDto } from "@/types/gathering/EditGatheringDto";
import { client } from "../client";

export const editGathering = async (id: string, dto: EditGatheringDto) => {
  const { data } = await client.patch(`/gathering/${id}`, dto);
  return data;
};
