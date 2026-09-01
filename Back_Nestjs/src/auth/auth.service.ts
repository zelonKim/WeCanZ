// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private appleJwksClient: jwksClient.JwksClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    // 구글 웹 클라이언트 ID 설정 (프론트에서 쓰던 Web Client ID와 일치해야 합니다)
    this.googleClient = new OAuth2Client(
      '277459634612-9psmm9h2mp6r2ngse42qhv64urfg2h8j.apps.googleusercontent.com',
    );

    // 애플 공개키 검증 클라이언트 세팅
    this.appleJwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
  }

  async signup(dto: SignupDto) {
    // 서비스 이용약관 동의 검증
    if (!dto.isTermsAgreed) {
      throw new BadRequestException(
        '서비스 이용약관에 동의해야 가입할 수 있습니다.',
      );
    }

    // 개인정보 처리방침동의 검증
    if (!dto.isPrivacyAgreed) {
      throw new BadRequestException(
        '개인정보 처리방침에 동의해야 가입할 수 있습니다.',
      );
    }

    // 비밀번호 일치 검증
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('비밀번호가 서로 일치하지 않습니다.');
    }

    // 이메일 및 닉네임 중복 검사
    const [existingEmail, existingNickname] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findFirst({ where: { nickname: dto.nickname } }),
    ]);

    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const now = new Date();

    // 5. DB에 유저 생성
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        password: hashedPassword,
        termsAgreedAt: now,
        privacyAgreedAt: now,
        marketingAgreedAt: dto.isMarketingAgreed ? now : null,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
      },
    });

    // 6. 토큰 발급
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: '회원가입이 완료되었습니다.',
      accessToken,
      user,
    };
  }

  /////////////////////////////////////////////////

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 일치하지 않습니다.',
      );
    }

    // 비밀번호 일치 여부 확인
    const isPasswordValid = await bcrypt.compare(dto.password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 혹은 비밀번호가 일치하지 않습니다.',
      );
    }

    // 토큰 발급
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: '로그인에 성공했습니다.',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  ////////////////////////////////////////////////

  async socialLogin(token: string, provider: 'google' | 'apple') {
    let email: string;
    let socialId: string;

    if (provider === 'google') {
      const payload = await this.verifyGoogleToken(token);
      email = payload.email;
      socialId = payload.sub;
    } else if (provider === 'apple') {
      const payload = await this.verifyAppleToken(token);
      email = payload.email;
      socialId = payload.sub;
    } else {
      throw new UnauthorizedException(
        '지원하지 않는 소셜 로그인 제공자입니다.',
      );
    }

    // 1. DB에서 이메일 또는 소셜 ID로 기존 회원 확인
    let user = await this.prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      // 혹은 약관 동의 여부 필드를 두고 나중에 업데이트할 수 있게 합니다.
      user = await this.prisma.user.create({
        data: {
          email,
          provider,
          socialId,
          nickname: email.split('@')[0],
        },
      });
      isNewUser = true;
    } else if (!user.termsAgreedAt || !user.privacyAgreedAt) {
      isNewUser = true;
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email });

    return {
      accessToken,
      isNewUser,
    };
  }

  // 구글 토큰 검증 함수
  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        // audience: '클라이언트_ID', // 필요시 검증 강화
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('유효하지 않은 구글 토큰입니다.');
      }
      return { email: payload.email, sub: payload.sub };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new UnauthorizedException('구글 토큰 검증에 실패했습니다.');
    }
  }

  // 애플 토큰 검증 함수
  private async verifyAppleToken(identityToken: string) {
    try {
      // 토큰 헤더에서 kid 추출
      const decodedToken: any = jwt.decode(identityToken, { complete: true });
      if (!decodedToken) {
        throw new UnauthorizedException('유효하지 않은 애플 토큰입니다.');
      }

      const kid = decodedToken.header.kid;
      const key = await this.getAppleSigningKey(kid);

      // 애플 공개키로 서명 검증 및 디코딩
      const verifiedPayload: any = jwt.verify(identityToken, key, {
        algorithms: ['RS256'],
      });

      return {
        email: verifiedPayload.email,
        sub: verifiedPayload.sub,
      };
    } catch (error) {
      console.error('Apple token verification error:', error);
      throw new UnauthorizedException('애플 토큰 검증에 실패했습니다.');
    }
  }

  // 애플 JWKS 공개키 가져오기 헬퍼
  private getAppleSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.appleJwksClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          console.error('Error fetching Apple signing key:', err);
          return reject(
            new UnauthorizedException('애플 공개키를 가져오는데 실패했습니다.'),
          );
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }
}
