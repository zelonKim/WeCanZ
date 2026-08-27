import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 친구 신청
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('자신에게는 친구 신청을 보낼 수 없습니다.');
    }

    // 받는 유저가 실제로 존재하는지 확인
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    // 이미 존재하는 관계 확인
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new ForbiddenException(
          '차단된 사용자에게는 친구 신청을 보낼 수 없습니다.',
        );
      }
      throw new ConflictException(
        '이미 친구 요청을 보냈거나, 친구 상태입니다.',
      );
    }

    return await this.prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        receiver: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  //////////////////////////////////////////////////////////////

  // 2. 친구 신청 수락
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('친구 요청을 찾을 수 없습니다.');
    }

    // 수락은 요청을 받은 사람(receiver)만 가능
    if (friendship.receiverId !== userId) {
      throw new ForbiddenException(
        '본인이 받은 친구 요청만 수락할 수 있습니다.',
      );
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException(
        '대기 중인 친구 요청만 수락할 수 있습니다.',
      );
    }

    return await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
  }

  //////////////////////////////////////////////////////////////

  // 3. 친구 신청 거절
  async rejectFriendRequest(friendshipId: string, userId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('친구 요청을 찾을 수 없습니다.');
    }

    // 거절도 요청을 받은 사람(receiver)만 가능
    if (friendship.receiverId !== userId) {
      throw new ForbiddenException(
        '본인이 받은 친구 요청만 거절할 수 있습니다.',
      );
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException(
        '대기 중인 친구 요청만 거절할 수 있습니다.',
      );
    }

    return await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.REJECTED },
    });
  }

  //////////////////////////////////////////////////////////////

  // 4. 내 친구 목록 조회
  async getMyFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { id: true, nickname: true, profileImage: true },
        },
        receiver: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });

    // 내 계정이 아닌 상대방 프로필 정보만 정제해서 반환
    return friendships.map((f) => {
      const friendProfile = f.senderId === userId ? f.receiver : f.sender;
      return {
        friendshipId: f.id,
        ...friendProfile,
      };
    });
  }

  //////////////////////////////////////////////////////////////

  // 5. 받은 친구 요청 목록 조회
  async getPendingRequests(userId: string) {
    return await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        sender: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }

  //////////////////////////////////////////////////////////////

  // 6. 친구 차단
  async blockFriend(targetUserId: string, userId: string) {
    if (targetUserId === userId) {
      throw new BadRequestException('자신은 차단할 수 없습니다.');
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    // 이미 관계가 존재하는 경우 BLOCKED로 상태 업데이트
    if (existing) {
      return await this.prisma.friendship.update({
        where: { id: existing.id },
        data: {
          senderId: userId,
          receiverId: targetUserId,
          status: FriendshipStatus.BLOCKED,
        },
      });
    }

    // 기존 관계가 없더라도 바로 차단 레코드 생성
    return await this.prisma.friendship.create({
      data: {
        senderId: userId,
        receiverId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });
  }

  //////////////////////////////////////////////////////////////

  // 7. 친구 차단 해제
  async unblockFriend(targetUserId: string, userId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        senderId: userId,
        receiverId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    if (!friendship) {
      throw new NotFoundException(
        '차단 목록에서 해당 사용자를 찾을 수 없습니다.',
      );
    }

    // DB 레코드를 삭제하여 관계 초기화
    return await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });
  }

  //////////////////////////////////////////////////////////////

  // 8. 내 차단 목록 조회
  async getBlockedUsers(userId: string) {
    return await this.prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: FriendshipStatus.BLOCKED,
      },
      include: {
        receiver: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    });
  }
}
