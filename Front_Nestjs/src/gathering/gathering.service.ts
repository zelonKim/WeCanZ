import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';
import { GatheringStatus } from '@prisma/client';

@Injectable()
export class GatheringService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 모임 생성
  async createGathering(
    hostId: string,
    createGatheringDto: CreateGatheringDto,
  ) {
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

  //////////////////////////////////////////////////////////////////

  // 2. 전체 모임 목록 조회
  async findAllGathering() {
    return await this.prisma.gathering.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  //////////////////////////////////////////////////////////////////

  // 3. 단일 모임 상세 조회
  async findOneGathering(id: string) {
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

  //////////////////////////////////////////////////////////////////

  // 4. 모임 수정
  async updateGathering(
    id: string,
    userId: string,
    updateGatheringDto: UpdateGatheringDto,
  ) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id },
    });

    if (!gathering) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    
    // 모임 작성자가 아닌 유저가 수정하려 하면 403 Forbidden
    if (gathering.hostId !== userId) {
      throw new ForbiddenException('모임을 수정할 권한이 없습니다.');
    }

    return await this.prisma.gathering.update({
      where: { id },
      data: updateGatheringDto,
    });
  }

  //////////////////////////////////////////////////////////////////

  // 5. 모임 시작 (진행)
  async startGathering(gatheringId: string, hostId: string) {
    // 모임 존재 여부 확인
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 권한 확인
    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('모임을 시작할 권한이 없습니다.');
    }

    // 상태별 예외 처리
    if (gathering.status === GatheringStatus.IN_PROGRESS) {
      throw new BadRequestException('이미 진행 중인 모임입니다.');
    }

    if (gathering.status === GatheringStatus.COMPLETED) {
      throw new BadRequestException('이미 종료된 모임은 시작할 수 없습니다.');
    }

    if (gathering.status === GatheringStatus.CANCELED) {
      throw new BadRequestException('취소된 모임은 시작할 수 없습니다.');
    }

    // 진행 중으로 변경
    return await this.prisma.gathering.update({
      where: { id: gatheringId },
      data: { status: GatheringStatus.IN_PROGRESS },
    });
  }

  //////////////////////////////////////////////////////////////////

  // 6. 모임 종료
  async completeGathering(gatheringId: string, hostId: string) {
    // 모임 존재 여부 확인
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 권한 확인
    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('모임을 종료할 권한이 없습니다. ');
    }

    // 상태별 예외 처리
    if (gathering.status === GatheringStatus.COMPLETED) {
      throw new BadRequestException('이미 종료된 모임입니다.');
    }

    if (gathering.status === GatheringStatus.CANCELED) {
      throw new BadRequestException('취소된 모임은 종료할 수 없습니다.');
    }

    if (
      gathering.status === GatheringStatus.OPEN ||
      gathering.status === GatheringStatus.FULL
    ) {
      throw new BadRequestException('모임이 진행되어야 종료할 수 있습니다.');
    }

    // 종료 처리
    return await this.prisma.gathering.update({
      where: { id: gatheringId },
      data: { status: GatheringStatus.COMPLETED },
    });
  }

  //////////////////////////////////////////////////////////////////

  // 7. 모임 취소
  async cancelGathering(gatheringId: string, hostId: string) {
    // 모임 존재 여부 확인
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 권한 확인
    if (gathering.hostId !== hostId) {
      throw new ForbiddenException('모임을 취소할 권한이 없습니다.');
    }

    // 상태별 정확한 예외 처리
    if (gathering.status === GatheringStatus.CANCELED) {
      throw new BadRequestException('이미 취소된 모임입니다.');
    }

    if (gathering.status === GatheringStatus.IN_PROGRESS) {
      throw new BadRequestException(
        '이미 진행 중인 모임은 취소할 수 없습니다.',
      );
    }

    if (gathering.status === GatheringStatus.COMPLETED) {
      throw new BadRequestException('이미 종료된 모임은 취소할 수 없습니다.');
    }

    // 취소 처리
    return await this.prisma.gathering.update({
      where: { id: gatheringId },
      data: { status: GatheringStatus.CANCELED },
    });
  }
}
