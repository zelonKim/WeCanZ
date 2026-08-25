import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipantStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 모임 메시지 DB 저장 (승인된 참가자만)
  async saveGatheringMessage(
    gatheringId: string,
    userId: string,
    message: string,
  ) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('모임을 찾을 수 없습니다.');
    }

    // 방장 여부 확인 및 승인 상태 체크
    let participantId: string | null = null;

    if (gathering.hostId !== userId) {
      const participant = await this.prisma.participant.findUnique({
        where: { userId_gatheringId: { userId, gatheringId } },
      });

      const isApproved =
        participant &&
        (participant.status === ParticipantStatus.APPROVED ||
          participant.status === ParticipantStatus.YES_SHOW);

      if (!isApproved) {
        throw new ForbiddenException(
          '승인된 참가자만 메시지를 보낼 수 있습니다.',
        );
      }

      participantId = participant.id;
    }

    // 채팅방 조회 및 자동 생성
    let room = await this.prisma.gatheringChatRoom.findFirst({
      where: { gatheringId },
    });

    if (!room) {
      room = await this.prisma.gatheringChatRoom.create({
        data: { gatheringId },
      });
    }

    // 메시지 생성
    return await this.prisma.gatheringChatMessage.create({
      data: {
        message,
        roomId: room.id,
        senderId: participantId ?? undefined,
        userId,
      },
      include: {
        user: { select: { id: true, nickname: true, profileImage: true } },
      },
    });
  }
}
