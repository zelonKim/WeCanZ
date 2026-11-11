import { MyGathering } from "@/types/gathering/MyGathering";
import { client } from "../client";

export const getMyGatherings = async (): Promise<MyGathering[]> => {
  const { data } = await client.get("/gathering/my");
  return data;
};
