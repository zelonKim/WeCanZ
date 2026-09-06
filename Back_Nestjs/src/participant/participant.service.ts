import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatheringStatus, ParticipantStatus } from '@prisma/client';

@Injectable()
export class ParticipantService {
  constructor(private readonly prisma: PrismaService) {}

  // 1-1. 모임 참여 신청
  async applyGathering(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
      include: { participants: true },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 본인은 신청 불가
    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 모임에 참여 신청할 수 없습니다.',
      );
    }

    // 이미 신청/참여 중인지 확인
    const existing = await this.prisma.participant.findUnique({
      where: {
        userId_gatheringId: { userId, gatheringId },
      },
    });

    if (existing) {
      if (existing.status === ParticipantStatus.BANNED) {
        throw new ForbiddenException(
          '강퇴된 벙개에는 다시 신청할 수 없습니다.',
        );
      }
      throw new ConflictException('이미 신청했거나 참여 중인 벙개입니다.');
    }

    // PENDING 상태로 참가 등록
    return await this.prisma.participant.create({
      data: {
        userId,
        gatheringId,
        status: ParticipantStatus.PENDING,
      },
    });
  }

  ////////////////////////////////////////////////////////////////

  // 1-2. 모임 참여 취소
  async cancelGathering(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
      include: { participants: true },
    });

    if (!gathering) {
      throw new NotFoundException('존재하지 않는 모임입니다.');
    }

    // 방장 본인은 신청 불가
    if (gathering.hostId === userId) {
      throw new BadRequestException(
        '방장은 본인의 모임에 참여 취소할 수 없습니다.',
      );
    }

    // 참여 취소
    return await this.prisma.participant.delete({
      where: {
        userId_gatheringId: {
          userId,
          gatheringId,
        },
      },
    });
  }

  ////////////////////////////////////////////////////////////////

  // 2. 참여자 승인 (방장 전용)
  async approveParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여자를 승인할 수 있습니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 현재 APPROVED 상태인 참여자 수 조회
      const approvedCount = await tx.participant.count({
        where: {
          gatheringId: participant.gatheringId,
          status: ParticipantStatus.APPROVED,
        },
      });

      if (approvedCount >= participant.gathering.maxPeople) {
        throw new BadRequestException(
          '정원이 차서 더 이상 승인할 수 없습니다.',
        );
      }

      // 1) 대상 참여자 승인 처리
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: {
          status: ParticipantStatus.APPROVED,
          joinedAt: new Date(),
        },
      });

      // 2) 이번 승인으로 정원이 찼는지 확인 후 모임 상태 변경 (FULL)
      const newApprovedCount = approvedCount + 1;
      if (newApprovedCount >= participant.gathering.maxPeople) {
        await tx.gathering.update({
          where: { id: participant.gatheringId },
          data: { status: GatheringStatus.FULL },
        });
      }

      return updatedParticipant;
    });
  }

  ////////////////////////////////////////////////////////////////

  // 3. 참여자 대기 처리 (방장 전용)
  async pendingParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여자를 대기시킬 수 있습니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1) 대상 참여자 PENDING 처리
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: { status: ParticipantStatus.PENDING },
      });

      // 2) APPROVED 인원 재계산 후 정원 미만이면 모임 상태 변경 (OPEN)
      const approvedCount = await tx.participant.count({
        where: {
          gatheringId: participant.gatheringId,
          status: ParticipantStatus.APPROVED,
        },
      });

      if (approvedCount < participant.gathering.maxPeople) {
        await tx.gathering.update({
          where: { id: participant.gatheringId },
          data: { status: GatheringStatus.OPEN },
        });
      }

      return updatedParticipant;
    });
  }

  ////////////////////////////////////////////////////////////////

  // 4. 참여자 강퇴 (방장 전용)
  async banParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여자를 강퇴할 수 있습니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1) 대상 참여자 BANNED 처리
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: { status: ParticipantStatus.BANNED },
      });

      // 2) APPROVED 인원 재계산 후 정원 미만이면 모임 상태 변경 (OPEN)
      const approvedCount = await tx.participant.count({
        where: {
          gatheringId: participant.gatheringId,
          status: ParticipantStatus.APPROVED,
        },
      });

      if (approvedCount < participant.gathering.maxPeople) {
        await tx.gathering.update({
          where: { id: participant.gatheringId },
          data: { status: GatheringStatus.OPEN },
        });
      }

      return updatedParticipant;
    });
  }
  ////////////////////////////////////////////////////////////////

  // 5. 노쇼 처리 (방장 전용)
  async noShowParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자의 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여자를 노쇼 처리할 수 있습니다.');
    }

    // 이미 NO_SHOW인 경우 중복 증가 방지
    if (participant.status === ParticipantStatus.NO_SHOW) {
      throw new BadRequestException('이미 노쇼 처리된 사용자입니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: { status: ParticipantStatus.NO_SHOW },
      });

      await tx.user.update({
        where: { id: participant.userId },
        data: {
          noShowCount: { increment: 1 },
        },
      });

      return updatedParticipant;
    });
  }

  ////////////////////////////////////////////////////////////////

  // 6. 예스쇼 처리 (방장 전용)
  async yesShowParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자의 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 출석 처리를 할 수 있습니다.');
    }

    if (participant.status === ParticipantStatus.YES_SHOW) {
      throw new BadRequestException('이미 출석 처리된 사용자입니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedParticipant = await tx.participant.update({
        where: { id: participantId },
        data: { status: ParticipantStatus.YES_SHOW },
      });

      await tx.user.update({
        where: { id: participant.userId },
        data: {
          yesShowCount: { increment: 1 },
        },
      });

      return updatedParticipant;
    });
  }

  ///////////////////////////////////////////////////

  // 채팅방 읽음 처리
  async updateLastRead(userId: string, gatheringId: string) {
    try {
      return await this.prisma.participant.update({
        where: {
          userId_gatheringId: {
            userId,
            gatheringId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException(
        '해당 모임의 참가자 정보를 찾을 수 없습니다.',
      );
    }
  }
}
