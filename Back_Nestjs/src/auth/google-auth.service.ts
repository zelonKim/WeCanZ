import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(
      '277459634612-9psmm9h2mp6r2ngse42qhv64urfg2h8j.apps.googleusercontent.com',
    );
  }

  async verifyGoogleToken(
    idToken: string,
  ): Promise<{ email: string; sub: string }> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
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
}
