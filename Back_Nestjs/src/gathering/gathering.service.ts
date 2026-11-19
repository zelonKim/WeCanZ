import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';
import { GatheringStatus, ParticipantStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { generateUniqueRoomCode } from 'utils/generateUniqueRoomCode';

@Injectable()
export class GatheringService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(GatheringService.name);

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoCompleteExpiredGatherings() {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12시간이 경과한 모임

      const result = await this.prisma.gathering.updateMany({
        where: {
          status: {
            notIn: [GatheringStatus.COMPLETED, GatheringStatus.CANCELED],
          },
          dateTime: {
            lte: twelveHoursAgo,
          },
        },
        data: {
          status: GatheringStatus.COMPLETED,
          roomCode: null,
        },
      });

      if (result.count > 0) {
        this.logger.log(
          `[Auto-Close] 12시간 이상 경과한 모임 ${result.count}개가 COMPLETED 처리되었습니다.`,
        );
      }
    } catch (err) {
      this.logger.error(
        '만료된 모임 자동 마감 처리 중 에러가 발생했습니다:',
        err,
      );
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////

  // 1. 모임 생성
  async createGathering(
    hostId: string,
    createGatheringDto: CreateGatheringDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const roomCode = await generateUniqueRoomCode(tx);

      const gathering = await tx.gathering.create({
        data: {
          ...createGatheringDto,
          hostId,
          roomCode,
          gatheringChatRooms: {
            create: {},
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

      return gathering;
    });
  }
  //////////////////////////////////////////////////////////////////

  // 2. 전체 모임 목록 조회
  async findAllGathering() {
    const [activeGatherings, completedGatherings] = await Promise.all([
      this.prisma.gathering.findMany({
        where: {
          status: {
            in: [
              GatheringStatus.OPEN,
              GatheringStatus.FULL,
              GatheringStatus.IN_PROGRESS,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          host: {
            select: { id: true, nickname: true, profileImage: true },
          },
        },
      }),

      this.prisma.gathering.findMany({
        where: {
          status: GatheringStatus.COMPLETED,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          host: {
            select: { id: true, nickname: true, profileImage: true },
          },
        },
      }),
    ]);

    return [...activeGatherings, ...completedGatherings];
  }

  //////////////////////////////////////////////////////////////////

  // 3. 나의 모임 조회
  async getMyGatherings(userId: string) {
    return await this.prisma.gathering.findMany({
      where: {
        OR: [
          { hostId: userId },

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
        createdAt: 'desc',
      },
    });
  }
  //////////////////////////////////////////////////////////////////

  // 4. 단일 모임 상세 조회
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

  // 5. 모임 수정
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
      // 현재 APPROVED 상태인 참가자 수 조회
      const approvedCount = await tx.participant.count({
        where: {
          gatheringId: id,
          status: ParticipantStatus.APPROVED,
        },
      });

      // 수정하려는 maxPeople 값 확인
      const newMaxPeople = updateGatheringDto.maxPeople ?? gathering.maxPeople;

      // 예외 처리: 현재 승인된 인원보다 최대 인원을 더 적게 줄이려고 하는 경우 방지
      if (updateGatheringDto.maxPeople && newMaxPeople < approvedCount) {
        throw new BadRequestException(
          `현재 승인된 인원(${approvedCount}명)보다 적은 수로 최대 인원을 설정할 수 없습니다.`,
        );
      }

      // 인원 수에 따른 GatheringStatus 계산
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

      // 모임 정보 및 status 업데이트
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

  // 6. 모임 시작 
  async startGathering(gatheringId: string, userId: string) {
    // 모임 존재 여부 확인
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 권한 확인
    if (gathering.hostId !== userId) {
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

    // 트랜잭션으로 대기자 정리 & 상태 변경 원자적(Atomic) 처리
    return await this.prisma.$transaction(async (tx) => {
      await tx.participant.deleteMany({
        where: {
          gatheringId,
          status: ParticipantStatus.PENDING, // enum 정의에 맞게 사용
        },
      });

      // 모임 상태를 IN_PROGRESS로 변경
      const updatedGathering = await tx.gathering.update({
        where: { id: gatheringId },
        data: { status: GatheringStatus.IN_PROGRESS },
      });

      return updatedGathering;
    });
  }

  //////////////////////////////////////////////////////////////////

  // 7. 모임 종료
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
      data: { status: GatheringStatus.COMPLETED, roomCode: null },
    });
  }

  //////////////////////////////////////////////////////////////////

  // 8. 모임 취소
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
      data: { status: GatheringStatus.CANCELED, roomCode: null },
    });
  }

  /////////////////////////////////////////////////////////////////

  // 9. 모임 찾기
  async searchGathering(userId: string, roomCode: string) {
    const cleanCode = roomCode?.trim().toLowerCase();

    const gathering = await this.prisma.gathering.findUnique({
      where: { roomCode: cleanCode },
      select: { id: true, title: true },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않거나 만료된 초대 코드입니다.');
    }

    return gathering;
  }

  /////////////////////////////////////////////////////////////////

  // 10. 유저의 안 읽은 모임 ID 목록 조회
  async getUnreadGatheringIds(userId: string): Promise<string[]> {
    // 유저가 참가를 승인받았거나 참석 확정된 Participant 목록 조회
    const myParticipants = await this.prisma.participant.findMany({
      where: {
        userId,
        status: { in: ['APPROVED', 'YES_SHOW'] },
      },
      select: {
        gatheringId: true,
        lastReadAt: true,
      },
    });

    if (myParticipants.length === 0) return [];

    // OR 조건으로 안 읽은 메시지가 존재하는 모임 찾기
    const unreadGatherings = await this.prisma.gathering.findMany({
      where: {
        OR: myParticipants.map((p) => ({
          id: p.gatheringId,
          gatheringChatRooms: {
            some: {
              messages: {
                some: {
                  createdAt: { gt: p.lastReadAt }, // 내 읽은 시간 이후
                  userId: { not: userId }, // 내가 보낸 메시지 제외
                },
              },
            },
          },
        })),
      },
      select: { id: true },
    });

    // 모임 ID 배열만 뽑아서 반환
    return unreadGatherings.map((g) => g.id);
  }
}
