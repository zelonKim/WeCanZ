import { AdItem } from "@/types/spot/AdItem";
import { client } from "../client";

export const getActiveAds = async (): Promise<AdItem[]> => {
  const response = await client.get("/commercial/ads");
  return response.data;
};