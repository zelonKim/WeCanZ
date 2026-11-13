import { SignupDto } from "@/types/auth/SignupDto";
import { client } from "../client";

export const signupUser = async (signupPayload: SignupDto) => {
  const { data } = await client.post("/auth/signup", signupPayload);
  return data;
};
