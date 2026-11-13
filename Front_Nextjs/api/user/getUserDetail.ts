import { client } from "../client";

export const getUserDetail = async (id: string) => {
  const { data } = await client.get(`/user/${id}`);
  return data;
};
