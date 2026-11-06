import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DirectChatRoomStatus, FriendshipStatus } from '@prisma/client';

@Injectable()
export class DirectChatService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 일대일 대화 신청
  async createOrRequestRoom(myId: string, targetUserId: string) {
    if (myId === targetUserId) {
      throw new BadRequestException('자신과는 대화방을 만들 수 없습니다.');
    }

    // 대상 유저 존재 여부 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    // 두 사람의 친구 관계(Friendship) 상태 조회
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: myId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: myId },
        ],
      },
    });

    // 친구 관계 상태에 따른 대화방 Status 결정
    let initialStatus: DirectChatRoomStatus = DirectChatRoomStatus.PENDING;

    if (friendship) {
      if (friendship.status === FriendshipStatus.BLOCKED) {
        // 차단된 유저인 경우
        throw new BadRequestException(
          '차단된 사용자에게는 DM을 요청할 수 없습니다.',
        );
      }

      if (friendship.status === FriendshipStatus.ACCEPTED) {
        // 이미 친구인 경우
        initialStatus = DirectChatRoomStatus.ACCEPTED;
      }
    }

    // 이미 생성된 대화방이 있는지 확인
    const existingRoom = await this.prisma.directChatRoom.findFirst({
      where: {
        OR: [
          { user1Id: myId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: myId },
        ],
      },
    });

    if (existingRoom) {
      // 이미 수락된 상태면 기존 대화방 반환 (💡 include 추가)
      if (existingRoom.status === DirectChatRoomStatus.ACCEPTED) {
        return await this.prisma.directChatRoom.findUnique({
          where: { id: existingRoom.id },
          include: {
            user1: { select: { id: true, nickname: true, profileImage: true } },
            user2: { select: { id: true, nickname: true, profileImage: true } },
          },
        });
      }

      // if (existingRoom.status === DirectChatRoomStatus.PENDING) {
      //   throw new ConflictException('이미 일대일 대화를 신청하였습니다.');
      // }

      // 만약 이전 요청이 거절(REJECTED)된 상태라면 다시 신청(PENDING)으로 상태로 업데이트
      if (existingRoom.status === DirectChatRoomStatus.REJECTED) {
        return await this.prisma.directChatRoom.update({
          where: { id: existingRoom.id },
          data: {
            user1Id: myId,
            user2Id: targetUserId,
            status: DirectChatRoomStatus.PENDING,
          },
          include: {
            user1: { select: { id: true, nickname: true, profileImage: true } },
            user2: { select: { id: true, nickname: true, profileImage: true } },
          },
        });
      }
    }

    // 대화방 생성
    return await this.prisma.directChatRoom.create({
      data: {
        user1Id: myId,
        user2Id: targetUserId,
        status: initialStatus,
      },
      include: {
        user1: { select: { id: true, nickname: true, profileImage: true } },
        user2: { select: { id: true, nickname: true, profileImage: true } },
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 2. 내가 받은 대화 요청 목록 조회
  async getPendingChatRequests(userId: string) {
    return await this.prisma.directChatRoom.findMany({
      where: {
        user2Id: userId,
        status: DirectChatRoomStatus.PENDING,
      },
      include: {
        user1: { select: { id: true, nickname: true, profileImage: true } },
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 3. 대화 신청 수락
  async acceptChatRequest(roomId: string, userId: string) {
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('대화방을 찾을 수 없습니다.');
    }

    // 대화 신청을 받은 사람만 수락 가능하도록 검증
    if (room.user2Id !== userId) {
      throw new ForbiddenException('대화 수락 권한이 없습니다.');
    }

    if (room.status !== DirectChatRoomStatus.PENDING) {
      throw new BadRequestException(
        '대기 중인 대화 요청만 수락할 수 있습니다.',
      );
    }

    return await this.prisma.directChatRoom.update({
      where: { id: roomId },
      data: { status: DirectChatRoomStatus.ACCEPTED },
    });
  }

  ////////////////////////////////////////////////////////////

  // 4. 대화 신청 거절
  async rejectChatRequest(roomId: string, userId: string) {
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('대화방을 찾을 수 없습니다.');
    }

    // 대화 신청을 받은 사람(user2)만 거절 가능
    if (room.user2Id !== userId) {
      throw new ForbiddenException('대화 거절 권한이 없습니다.');
    }

    if (room.status !== DirectChatRoomStatus.PENDING) {
      throw new BadRequestException(
        '대기 중인 대화 요청만 거절할 수 있습니다.',
      );
    }

    const targetUserId = room.user1Id;

    if (!targetUserId) {
      return;
    }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    // 차단된 상태라면 레코드를 완전히 삭제하여 재신청 방지
    if (friendship && friendship.status === FriendshipStatus.BLOCKED) {
      return await this.prisma.directChatRoom.delete({
        where: { id: roomId },
      });
    }

    // 일반적인 거절일 경우 REJECTED 상태로 업데이트
    return await this.prisma.directChatRoom.update({
      where: { id: roomId },
      data: { status: DirectChatRoomStatus.REJECTED },
    });
  }

  ////////////////////////////////////////////////////////////

  // 5. 내 일대일 대화방 목록 조회
  async getMyRooms(userId: string) {
    const rooms = await this.prisma.directChatRoom.findMany({
      where: {
        status: DirectChatRoomStatus.ACCEPTED,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, nickname: true, profileImage: true } },
        user2: { select: { id: true, nickname: true, profileImage: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return rooms.map((room) => {
      const isUser1 = room.user1Id === userId;

      // 💡 가장 최근 메시지 1건 추출
      const lastMsg =
        room.messages && room.messages.length > 0 ? room.messages[0] : null;

      return {
        ...room,
        targetUser: isUser1 ? room.user2 : room.user1,
        lastMessage: lastMsg
          ? {
              content: lastMsg.message, // 💡 DB/소켓의 message 필드를 content로 매핑해줍니다.
              createdAt: lastMsg.createdAt,
            }
          : null,
      };
    });
  }

  ////////////////////////////////////////////////////////////

  // 메시지 보낼 수 있는 상태인지 검증하는 헬퍼 메서드
  private async validateAcceptedRoom(roomId: string, userId: string) {
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 대화방입니다.');
    }

    // 대화방 참여자인지 확인
    if (room.user1Id !== userId && room.user2Id !== userId) {
      throw new ForbiddenException('해당 대화방의 참여자가 아닙니다.');
    }

    // ACCEPTED 상태 검증 핵심 로직
    if (room.status !== DirectChatRoomStatus.ACCEPTED) {
      throw new ForbiddenException(
        '상대방이 수락한 경우에만 DM을 보낼 수 있습니다.',
      );
    }

    return room;
  }

  ////////////////////////////////////////////////////////////

  // 6. 다이렉트 메시지 전송
  async createMessage(roomId: string, senderId: string, message: string) {
    if (!message || message.trim() === '') {
      throw new BadRequestException('메시지 내용을 입력해 주세요.');
    }

    return await this.prisma.directChatMessage.create({
      data: {
        roomId,
        senderId,
        message,
      },
      include: {
        sender: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 7. 다이렉트 메시지 조회 (이전 대화 기록 조회 가능)
  async getMessages(roomId: string, userId: string) {
    // 방 참여자 및 수락 상태만 검증 (차단 검증 조건 제거)
    await this.validateAcceptedRoom(roomId, userId);

    return await this.prisma.directChatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  ////////////////////////////////////////////////////////////

  // 8. 다이렉트 메시지 삭제
  async deleteMessage(messageId: string, userId: string) {
    const chatMessage = await this.prisma.directChatMessage.findUnique({
      where: { id: messageId },
    });

    if (!chatMessage) {
      throw new NotFoundException('메시지를 찾을 수 없습니다.');
    }

    // 본인 메시지인지 확인
    if (chatMessage.senderId !== userId) {
      throw new ForbiddenException(
        '본인이 작성한 메시지만 삭제할 수 있습니다.',
      );
    }

    return await this.prisma.directChatMessage.delete({
      where: { id: messageId },
    });
  }

  ////////////////////////////////////////////////////////////

  // 9. 일대일 대화방 나가기 (대화방 및 메시지 완전 삭제)
  async leaveRoom(roomId: string, userId: string) {
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 대화방입니다.');
    }

    // 방 참여자인지 확인
    if (room.user1Id !== userId && room.user2Id !== userId) {
      throw new ForbiddenException('해당 대화방의 참여자가 아닙니다.');
    }

    // 대화방 삭제
    await this.prisma.directChatRoom.delete({
      where: { id: roomId },
    });

    return { message: '일대일 대화방을 나갔습니다.' };
  }

  ////////////////////////////////////////////////////////////

  // 10. 일대일 대화방 조회
  async getRoomById(roomId: string, currentUserId?: string) {
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
      include: {
        user1: {
          select: { id: true, nickname: true, profileImage: true },
        },
        user2: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 대화방입니다.');
    }

    // 💡 currentUserId가 넘어온 경우에만 상대방(partner) 정보 계산
    const partner = currentUserId
      ? room.user1Id === currentUserId
        ? room.user2
        : room.user1
      : null;

    return {
      ...room,
      ...(partner && { partner }), // partner가 있을 때만 객체에 포함
    };
  }

  ////////////////////////////////////////////////////////////

  // 11. 최근 메시지 조회
  async getLastMessage(roomId: string) {
    const lastMessage = await this.prisma.directChatMessage.findFirst({
      where: {
        roomId,
      },
      orderBy: {
        createdAt: 'desc', // 가장 최신 메시지 순 정렬
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
    });

    return lastMessage;
  }

  ////////////////////////////////////////////////////////////////

  async getUsersPushTokens(roomId: string, senderId: string) {
    // 1. roomId로 채팅방 정보와 두 유저의 pushToken을 함께 조회
    const room = await this.prisma.directChatRoom.findUnique({
      where: { id: roomId },
      select: {
        user1Id: true,
        user2Id: true,
        user1: {
          select: {
            id: true,
            pushToken: true,
            nickname: true,
            profileImage: true,
          },
        },
        user2: {
          select: {
            id: true,
            pushToken: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    if (!room) return [];

    // 2. senderId가 아닌 상대방 유저 객체 찾기
    const receiver = room.user1Id === senderId ? room.user2 : room.user1;

    // 3. 상대방 및 pushToken이 존재하는지 확인 후 반환
    if (!receiver || !receiver.pushToken) {
      return [];
    }

    return [
      {
        userId: receiver.id,
        pushToken: receiver.pushToken,
        nickname: receiver.nickname,
        profileImage: receiver.profileImage,
      },
    ];
  }
}
