export interface SignupDto {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  isMarketingAgreed: boolean;
}
