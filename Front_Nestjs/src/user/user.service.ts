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
    return await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        email: true,
        nickname: true,
        profileImage: true,
        bio: true,
        yesShowCount: true,
        noShowCount: true,
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
}
