import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';

@Injectable()
export class GatheringService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 모임 생성 
  async create(hostId: string, createGatheringDto: CreateGatheringDto) {
  return await this.prisma.gathering.create({
    data: {
      ...createGatheringDto,
      hostId,
      // 모임 생성 시 채팅방도 동시에 생성 (1:N 연동)
      gatheringChatRooms: {
        create: {}, // 기본값(id, createdAt)으로 1개 생성
      },
    },
    include: {
      host: {
        select: { id: true, nickname: true, profileImage: true },
      },
      gatheringChatRooms: true,
    },
  });
}

  // 2. 전체 모임 목록 조회
  async findAll() {
    return await this.prisma.gathering.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  // 3. 단일 모임 상세 조회
  async findOne(id: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id },
      include: {
        host: {
          select: { id: true, nickname: true, profileImage: true },
        },
        participants: true,
      },
    });

    if (!gathering) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }

    return gathering;
  }


  // 4. 모임 수정 
  async update(id: string, userId: string, updateGatheringDto: UpdateGatheringDto) {
    const gathering = await this.findOne(id);

    // 모임 작성자가 아닌 유저가 수정하려 하면 403 Forbidden
    if (gathering.hostId !== userId) {
      throw new ForbiddenException('모임을 수정할 권한이 없습니다.');
    }

    return await this.prisma.gathering.update({
      where: { id },
      data: updateGatheringDto,
    });
  }


  // 5. 모임 삭제 
  async remove(id: string, userId: string) {
    const gathering = await this.findOne(id);

    // 모임 작성자가 아닌 유저가 삭제하려 하면 403 Forbidden
    if (gathering.hostId !== userId) {
      throw new ForbiddenException('모임을 삭제할 권한이 없습니다.');
    }

    await this.prisma.gathering.delete({
      where: { id },
    });

    return { message: '모임이 성공적으로 삭제되었습니다.' };
  }
}