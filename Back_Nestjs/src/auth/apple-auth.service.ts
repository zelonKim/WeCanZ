import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class AppleAuthService {
  private readonly appleJwksClient: jwksClient.JwksClient;

  constructor() {
    this.appleJwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
  }

  async verifyAppleToken(
    identityToken: string,
  ): Promise<{ email: string; sub: string }> {
    try {
      const decodedToken: any = jwt.decode(identityToken, { complete: true });
      if (!decodedToken) {
        throw new UnauthorizedException('유효하지 않은 애플 토큰입니다.');
      }

      const kid = decodedToken.header.kid;
      const key = await this.getAppleSigningKey(kid);

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

  ///////////////////////////////////////////////////////////////////////

  
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
