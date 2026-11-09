import { CreateGatheringDto } from "@/types/gathering/CreateGatheringDto";
import { client } from "../client";

export const createGathering = async (dto: CreateGatheringDto) => {
  const { data } = await client.post("/gathering", dto);
  return data;
};