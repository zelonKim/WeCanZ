import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: '닉네임은 최소 2글자 이상이어야 합니다.' })
  nickname!: string;
}
