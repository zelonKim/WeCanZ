import { SocialLoginDto } from "@/types/auth/SocialLoginDto";
import { client } from "../client";

export const socialLoginUser = async ({
  idToken,
  provider,
}: SocialLoginDto) => {
  const { data } = await client.post("/auth/social-login", {
    token: idToken,
    provider: provider,
  });
  return data;
};
