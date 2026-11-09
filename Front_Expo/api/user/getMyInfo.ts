import { client } from "@/api/client";
import { MyInfo } from "@/types/user/MyInfo";

export const getMyInfo = async (): Promise<MyInfo> => {
  const { data } = await client.get("/user/me");
  return data;
};
