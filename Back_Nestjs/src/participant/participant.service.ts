import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipantStatus } from '@prisma/client';

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
          '강퇴된 모임에는 다시 신청할 수 없습니다.',
        );
      }
      throw new ConflictException('이미 신청했거나 참여 중인 모임입니다.');
    }

    // 정원 초과 검증 (승인된 인원 기준)
    const approvedCount = gathering.participants.filter(
      (p) => p.status === ParticipantStatus.APPROVED,
    ).length;

    if (approvedCount >= gathering.maxPeople) {
      throw new BadRequestException('이미 정원이 가득 찬 모임입니다.');
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

  // 2-1. 참여자 승인 (방장 전용)
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

    // 승인(APPROVED) 시 정원 체크
    const approvedCount = await this.prisma.participant.count({
      where: {
        gatheringId: participant.gatheringId,
        status: {
          in: [ParticipantStatus.APPROVED],
        },
      },
    });

    if (approvedCount >= participant.gathering.maxPeople) {
      throw new BadRequestException('정원이 차서 더 이상 승인할 수 없습니다.');
    }

    return await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.APPROVED,
        joinedAt: new Date(),
      },
    });
  }

  ////////////////////////////////////////////////////////////////

  // 2-2. 참여자 대기 (방장 전용)
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

    return await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.PENDING,
      },
    });
  }
  ////////////////////////////////////////////////////////////////

  // 3. 참여자 강퇴 (방장 전용)
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

    return await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.BANNED,
      },
    });
  }

  ////////////////////////////////////////////////////////////////

  // 4. 노쇼 처리 (방장 전용)
  async noShowParticipant(participantId: string, hostId: string) {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
      include: { gathering: true },
    });

    if (!participant) {
      throw new NotFoundException('참여자 정보를 찾을 수 없습니다.');
    }

    if (participant.gathering.hostId !== hostId) {
      throw new ForbiddenException('방장만 참여자를 노쇼 처리할 수 있습니다.');
    }

    return await this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: ParticipantStatus.NO_SHOW,
      },
    });
  }
}
