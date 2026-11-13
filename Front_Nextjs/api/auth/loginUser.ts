import { LoginDto } from "@/types/auth/LoginDto";
import { client } from "../client";

export const loginUser = async (loginPayload: LoginDto) => {
  const { data } = await client.post("/auth/login", loginPayload);
  return data;
};
