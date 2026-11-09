import { LoginData } from "@/types/auth/LoginData";
import { client } from "../client";

export const loginUser = async (loginData: LoginData) => {
    const { data } = await client.post("/auth/login", loginData);
    return data;
  };
