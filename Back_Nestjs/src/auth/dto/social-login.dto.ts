import { IsString, IsIn } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  token: string;

  @IsIn(['google', 'apple'])
  provider: 'google' | 'apple';
}
