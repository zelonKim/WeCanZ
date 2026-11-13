import { Gathering } from "@/types/gathering/Gathering";
import { client } from "../client";

export const getGatherings = async (): Promise<Gathering[]> => {
  const { data } = await client.get("/gathering");
  return data;
};
