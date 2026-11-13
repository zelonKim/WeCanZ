import { CompleteAgreePayload } from "@/types/user/CompleteAgreePayload";
import { client } from "../client";

export const updateAgreementAndNickname = async ({
  nickname,
  isMarketingAgreed,
}: CompleteAgreePayload) => {
  const { data } = await client.patch("/user/profile", {
    nickname,
    termsAgreedAt: new Date().toISOString(),
    privacyAgreedAt: new Date().toISOString(),
    marketingAgreedAt: isMarketingAgreed ? new Date().toISOString() : null,
  });
  return data;
};
