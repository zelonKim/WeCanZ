import {
  Injectable,
  BadRequestException,
  NotFoundException,
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
      if (existing.status === FriendshipStatus.PENDING) {
        throw new BadRequestException(
          '이미 친구 요청을 보냈거나, 친구 상태입니다.',
        );
      }
      if (existing.status === FriendshipStatus.REJECTED) {
        throw new BadRequestException('현재 친구 요청이 거절된 상태입니다.');
      }
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException(
          '차단된 사용자에게는 친구 요청을 보낼 수 없습니다.',
        );
      }
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
  // 백엔드: getMyFriends
  async getMyFriends(userId: string) {
    // 1. 내가 차단(BLOCKED)한 유저 ID 목록을 먼저 조회
    const blockedFriendships = await this.prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: FriendshipStatus.BLOCKED,
      },
      select: { receiverId: true },
    });

    const blockedUserIds = blockedFriendships.map((b) => b.receiverId);

    // 2. 차단한 유저(blockedUserIds)를 제외하고 ACCEPTED 친구 관계 조회
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { senderId: userId, receiverId: { notIn: blockedUserIds } },
          { receiverId: userId, senderId: { notIn: blockedUserIds } },
        ],
      },
      include: {
        sender: { select: { id: true, nickname: true, profileImage: true } },
        receiver: { select: { id: true, nickname: true, profileImage: true } },
      },
    });

    return friendships.map((f) => {
      const friendProfile = f.senderId === userId ? f.receiver : f.sender;
      return {
        friendshipId: f.id,
        status: f.status,
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

  // 6. 유저차단
  async blockFriend(targetUserId: string, userId: string) {
    if (targetUserId === userId) {
      throw new BadRequestException('자신은 차단할 수 없습니다.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    // 내가 상대를 차단한 기록이 이미 있는지 확인
    const myBlockRecord = await this.prisma.friendship.findFirst({
      where: {
        senderId: userId,
        receiverId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    if (myBlockRecord) {
      throw new BadRequestException('이미 차단한 사용자입니다.');
    }

    // 기존 친구 관계가 있다면 삭제 또는 상태 변경 처리
    // (상대방이 나를 차단한 기록은 건드리지 않고, 내가 상대를 향해 걸었던 관계만 처리)
    await this.prisma.friendship.deleteMany({
      where: {
        senderId: userId,
        receiverId: targetUserId,
      },
    });

    // 새로운 '내가 상대를 차단함' 상태의 레코드 생성
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
    // 1. 오직 '내가(userId) 상대방을(targetUserId)' 차단한 레코드만 정확히 찾기
    const myBlockRecord = await this.prisma.friendship.findFirst({
      where: {
        senderId: userId,
        receiverId: targetUserId,
        status: FriendshipStatus.BLOCKED,
      },
    });

    if (!myBlockRecord) {
      throw new NotFoundException(
        '차단 목록에서 해당 사용자를 찾을 수 없습니다.',
      );
    }

    // 2. 상대방이 나를 차단한 레코드(senderId: targetUserId, receiverId: userId)는 절대 건드리지 않고,
    // 오직 내가 생성한 차단 레코드만 삭제하여 원점(요청 전 상태)으로 돌립니다.
    return await this.prisma.friendship.delete({
      where: { id: myBlockRecord.id },
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
