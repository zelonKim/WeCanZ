import { EditGatheringDto } from "@/types/gathering/EditGatheringDto";
import { client } from "../client";

export const editGathering = async ({
  id,
  editGatheringPayload,
}: {
  id: string;
  editGatheringPayload: EditGatheringDto;
}) => {
  const { data } = await client.patch(`/gathering/${id}`, editGatheringPayload);
  return data;
};
