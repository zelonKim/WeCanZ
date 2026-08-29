import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return user;
  }

  ////////////////////////////////////

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const { isMarketingAgreed, ...profileData } = dto;

    let marketingAgreedAt: Date | null | undefined = undefined;

    if (isMarketingAgreed !== undefined) {
      marketingAgreedAt = isMarketingAgreed ? new Date() : null;
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...profileData,
        ...(marketingAgreedAt !== undefined && { marketingAgreedAt }),
      },
      select: {
        email: true,
        nickname: true,
        profileImage: true,
        bio: true,
        yesShowCount: true,
        noShowCount: true,
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
}
