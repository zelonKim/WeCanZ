import { client } from "../client";

export const updateAgreementAndNickname = async (
  nickname: string,
  isMarketingAgreed: boolean,
) => {
  const { data } = await client.patch("/user/profile", {
    nickname,
    termsAgreedAt: new Date().toISOString(),
    privacyAgreedAt: new Date().toISOString(),
    marketingAgreedAt: isMarketingAgreed ? new Date().toISOString() : null,
  });
  return data;
};
