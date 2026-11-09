import { SignupData } from "@/types/auth/SignupData";
import { client } from "../client";

export const signupUser = async (signupData: SignupData) => {
  const { data } = await client.post("/auth/signup", signupData);
  return data;
};
