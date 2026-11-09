import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Express } from 'express';
import 'multer';
import FormData from 'form-data';
import { R2_CLIENT } from 'utils/r2.provider';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(R2_CLIENT) private readonly s3Client: S3Client,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImage: true,
        bio: true,
        yesShowCount: true,
        noShowCount: true,
        termsAgreedAt: true,
        privacyAgreedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return user;
  }

  ////////////////////////////////////

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const {
      nickname,
      termsAgreedAt,
      privacyAgreedAt,
      marketingAgreedAt,
      ...profileData
    } = dto;

    if (nickname !== undefined) {
      if (nickname.trim().length < 2) {
        throw new BadRequestException('닉네임은 최소 2글자 이상이어야 합니다.');
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          nickname,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...profileData,

        ...(termsAgreedAt && { termsAgreedAt: new Date(termsAgreedAt) }),
        ...(privacyAgreedAt && {
          privacyAgreedAt: new Date(privacyAgreedAt),
        }),
        ...(marketingAgreedAt !== undefined && {
          marketingAgreedAt: marketingAgreedAt
            ? new Date(marketingAgreedAt)
            : null,
        }),
      },
      select: {
        email: true,
        nickname: true,
        profileImage: true,
        bio: true,
        yesShowCount: true,
        noShowCount: true,
        termsAgreedAt: true,
        privacyAgreedAt: true,
        marketingAgreedAt: true,
      },
    });
  }
  ////////////////////////////////////

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  ////////////////////////////////////

  async findByNickname(nickname: string) {
    const user = await this.prisma.user.findUnique({
      where: { nickname },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 닉네임입니다.');
    }

    return user;
  }

  ////////////////////////////////////

  async uploadProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `profiles/${userId}-${Date.now()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return `${process.env.R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw new InternalServerErrorException(
        '프로필 이미지 업로드 중 오류가 발생했습니다.',
      );
    }
  }

  ////////////////////////////////////

  async getUserProfile(id: string) {
    // 💡 숫자형 ID인 경우 Number(id)로 변환 필요 (UUID라면 그대로 id 사용)
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        bio: true,
        noShowCount: true,
        yesShowCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return user;
  }

  /////////////////////////////////////////

  async updatePushToken(userId: string, pushToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }

  /////////////////////////////////////////

  async deletePushToken(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pushToken: null,
      },
    });

    return { message: '푸시 토큰이 성공적으로 삭제되었습니다.' };
  }
}
