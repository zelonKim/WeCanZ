import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';
import { GatheringStatus, ParticipantStatus } from '@prisma/client';

@Injectable()
export class GatheringService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 모임 생성
  async createGathering(
    hostId: string,
    createGatheringDto: CreateGatheringDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const gathering = await tx.gathering.create({
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

      await tx.participant.create({
        data: {
          gatheringId: gathering.id,
          userId: hostId,
          status: ParticipantStatus.APPROVED,
        },
      });
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
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            noShowCount: true,
            yesShowCount: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
                noShowCount: true,
                yesShowCount: true,
              },
            },
          },
        },
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

    return await this.prisma.$transaction(async (tx) => {
      // 1. 현재 APPROVED 상태인 참가자 수 조회
      const approvedCount = await tx.participant.count({
        where: {
          gatheringId: id,
          status: ParticipantStatus.APPROVED,
        },
      });

      // 2. 수정하려는 maxPeople 값 확인 (전달받은 값이 없으면 기존 maxPeople 유지)
      const newMaxPeople = updateGatheringDto.maxPeople ?? gathering.maxPeople;

      // 예외 처리: 현재 승인된 인원보다 최대 인원을 더 적게 줄이려고 하는 경우 방지
      if (updateGatheringDto.maxPeople && newMaxPeople < approvedCount) {
        throw new BadRequestException(
          `현재 승인된 인원(${approvedCount}명)보다 적은 수로 최대 인원을 설정할 수 없습니다.`,
        );
      }

      // 3. 인원 수에 따른 GatheringStatus 계산
      let newStatus = gathering.status;

      // 모임이 이미 마감(COMPLETED)되거나 취소(CANCELLED)된 상태가 아닐 때만 인원에 따라 OPEN/FULL 변경
      if (
        gathering.status === GatheringStatus.OPEN ||
        gathering.status === GatheringStatus.FULL
      ) {
        newStatus =
          approvedCount >= newMaxPeople
            ? GatheringStatus.FULL
            : GatheringStatus.OPEN;
      }

      // 4. 모임 정보 및 status 업데이트
      return await tx.gathering.update({
        where: { id },
        data: {
          ...updateGatheringDto,
          status: newStatus,
        },
      });
    });
  }

  //////////////////////////////////////////////////////////////////

  // 5. 모임 시작 (진행)
  async startGathering(gatheringId: string, userId: string) {
    // 1. 모임 존재 여부 확인
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 2. 방장 권한 확인
    if (gathering.hostId !== userId) {
      throw new ForbiddenException('모임을 시작할 권한이 없습니다.');
    }

    // 3. 상태별 예외 처리
    if (gathering.status === GatheringStatus.IN_PROGRESS) {
      throw new BadRequestException('이미 진행 중인 모임입니다.');
    }

    if (gathering.status === GatheringStatus.COMPLETED) {
      throw new BadRequestException('이미 종료된 모임은 시작할 수 없습니다.');
    }

    if (gathering.status === GatheringStatus.CANCELED) {
      throw new BadRequestException('취소된 모임은 시작할 수 없습니다.');
    }

    // 4. 트랜잭션으로 대기자 정리 & 상태 변경 원자적(Atomic) 처리
    return await this.prisma.$transaction(async (tx) => {
      // (A) 승인 대기 중(PENDING)인 참가자 일괄 삭제
      await tx.participant.deleteMany({
        where: {
          gatheringId,
          status: ParticipantStatus.PENDING, // enum 정의에 맞게 사용
        },
      });

      // (B) 모임 상태를 IN_PROGRESS로 변경
      const updatedGathering = await tx.gathering.update({
        where: { id: gatheringId },
        data: { status: GatheringStatus.IN_PROGRESS },
      });

      return updatedGathering;
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

  //////////////////////////////////////////////////////////////////

  // 8. 나의 모임 조회
  async getMyGatherings(userId: string) {
    return await this.prisma.gathering.findMany({
      where: {
        OR: [
          // 1. 내가 방장인 모임
          { hostId: userId },
          // 2. 내가 참여 신청했거나 참여 중인 모임
          {
            participants: {
              some: {
                userId,
                status: {
                  in: [
                    ParticipantStatus.PENDING,
                    ParticipantStatus.APPROVED,
                    ParticipantStatus.YES_SHOW,
                  ],
                },
              },
            },
          },
        ],
      },
      include: {
        // 프런트엔드 뱃지 처리를 위한 참여자 정보 포함
        participants: {
          select: {
            userId: true,
            status: true,
          },
        },
        host: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 최신순 정렬
      },
    });
  }
}
