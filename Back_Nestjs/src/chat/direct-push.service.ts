import { Injectable, Logger } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { DirectChatService } from './direct-chat.service';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DirectPushService {
  private readonly logger = new Logger(DirectPushService.name);
  private readonly expo = new Expo();

  constructor(
    private readonly prisma: PrismaService,
    private readonly directChatService: DirectChatService,
  ) {}

  async sendDMPushNoti(
    roomId: string,
    senderId: string,
    message: string,
    isUserInRoomFn: (userId: string, roomId: string) => boolean,
  ): Promise<void> {
    try {
      // 발신자 정보 조회 (닉네임, 프로필 이미지)
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: { nickname: true, profileImage: true },
      });

      // 타겟 유저 푸시 토큰 조회
      const targetUsers = await this.directChatService.getUsersPushTokens(
        roomId,
        senderId,
      );

      const pushMessages: any[] = [];

      for (const user of targetUsers) {
        // 토큰 유효성 검사
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          continue;
        }

        // 현재 방에 접속 중인지 검사
        const isUserActiveInRoom = isUserInRoomFn(user.userId, roomId);
        if (isUserActiveInRoom) {
          continue;
        }

        // 메시지 페이로드 구성
        pushMessages.push({
          to: user.pushToken,
          sound: 'default' as const,
          title: '새로운 DM',
          body: message,
          priority: 'high',
          channelId: 'default',
          data: {
            roomId,
            type: 'DM',
            nickname: sender?.nickname ?? '',
            profileImage: sender?.profileImage ?? '',
          },
          android: {
            channelId: 'default',
            priority: 'high',
            sound: true,
            vibrate: true,
          },
        });
      }

      if (pushMessages.length === 0) return;

      // 청크 단위로 나누어 일괄 전송
      const chunks = this.expo.chunkPushNotifications(pushMessages);
      for (const chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          this.logger.error('Expo DM 푸시 전송 실패:', error);
        }
      }
    } catch (err) {
      this.logger.error('DM 푸시 알림 전송 에러:', err);
    }
  }
}
