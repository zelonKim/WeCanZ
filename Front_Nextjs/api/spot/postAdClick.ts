import { client } from "../client";

export const increaseClickCount = async (id: string) => {
  await client.post(`/commercial/ads/${id}/click`);
};
