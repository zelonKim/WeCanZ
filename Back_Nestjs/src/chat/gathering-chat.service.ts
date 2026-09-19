import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParticipantStatus } from '@prisma/client';

@Injectable()
export class GatheringChatService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔒 [승인 참가자 검증] 모임 방장이거나 승인/참여 완료 상태인지 확인
  private async validateParticipant(gatheringId: string, userId: string) {
    const gathering = await this.prisma.gathering.findUnique({
      where: { id: gatheringId },
    });

    if (!gathering) {
      throw new NotFoundException('모임을 찾을 수 없습니다.');
    }

    if (gathering.hostId === userId) {
      return { gathering, participantId: null };
    }

    const participant = await this.prisma.participant.findUnique({
      where: { userId_gatheringId: { userId, gatheringId } },
    });

    const isApproved =
      participant &&
      (participant.status === ParticipantStatus.APPROVED ||
        participant.status === ParticipantStatus.YES_SHOW);

    if (!isApproved) {
      throw new ForbiddenException(
        '승인된 참가자만 모임 채팅 이용이 가능합니다.',
      );
    }

    return { gathering, participantId: participant.id };
  }

  ////////////////////////////////////////////////////////////

  // 1. 모임 채팅 메시지 조회
  async getMessages(gatheringId: string, userId: string) {
    await this.validateParticipant(gatheringId, userId);

    const room = await this.prisma.gatheringChatRoom.findFirst({
      where: { gatheringId },
    });

    if (!room) {
      return [];
    }

    return await this.prisma.gatheringChatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { include: { user: true } },
        user: true,
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 2. 모임 채팅 메시지 생성
  async createMessage(gatheringId: string, userId: string, message: string) {
    const { participantId } = await this.validateParticipant(
      gatheringId,
      userId,
    );

    let room = await this.prisma.gatheringChatRoom.findFirst({
      where: { gatheringId },
    });

    if (!room) {
      room = await this.prisma.gatheringChatRoom.create({
        data: { gatheringId },
      });
    }

    return await this.prisma.gatheringChatMessage.create({
      data: {
        message: message,
        roomId: room.id,
        userId: userId,
        ...(participantId && { senderId: participantId }),
      },
      include: {
        user: { select: { id: true, nickname: true, profileImage: true } },
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 3. 모임 채팅 메시지 삭제
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.gatheringChatMessage.findUnique({
      where: { id: messageId },
      include: { room: { include: { gathering: true } } },
    });

    if (!message) {
      throw new NotFoundException('메시지를 찾을 수 없습니다.');
    }

    const isOwner = message.userId === userId;
    const isHost = message.room.gathering.hostId === userId;

    if (!isOwner && !isHost) {
      throw new ForbiddenException(
        '방장 혹은 작성자만 메시지를 삭제할 수 있습니다.',
      );
    }

    return await this.prisma.gatheringChatMessage.delete({
      where: { id: messageId },
    });
  }

  ////////////////////////////////////////////////////////////

  async getUsersPushTokens(gatheringId: string, senderId: string) {
    // 모임에 속한 멤버 중 보낸 사람을 제외하고, pushToken이 존재하는 유저 조회
    const members = await this.prisma.participant.findMany({
      where: {
        gatheringId: gatheringId,
        userId: {
          not: senderId, 
        },
        user: {
          pushToken: {
            not: null, 
          },
        },
      },
      select: {
        user: {
          select: {
            pushToken: true,
          },
        },
      },
    });

    return members
      .map((member) => ({ pushToken: member.user.pushToken }))
      .filter((item) => item.pushToken !== null);
  }
}
