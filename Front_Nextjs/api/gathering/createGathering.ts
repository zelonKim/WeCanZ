import { CreateGatheringDto } from "@/types/gathering/CreateGatheringDto";
import { client } from "../client";

export const createGathering = async (
  createGatheringPayload: CreateGatheringDto,
) => {
  const { data } = await client.post("/gathering", createGatheringPayload);
  return data;
};
