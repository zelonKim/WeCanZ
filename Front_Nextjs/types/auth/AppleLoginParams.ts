import { SocialLoginDto } from "./SocialLoginDto";

export interface socialLoginParams {
  t: any;
  socialLoginMutate: (data: SocialLoginDto) => void;
}
