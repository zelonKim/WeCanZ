import { Injectable, Logger } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { GatheringChatService } from './gathering-chat.service';

@Injectable()
export class GatheringPushService {
  private readonly logger = new Logger(GatheringPushService.name);
  private readonly expo = new Expo();

  constructor(private readonly gatheringChatService: GatheringChatService) {}

  async sendGatheringPushNoti(
    gatheringId: string,
    senderId: string,
    message: string,
    isUserInRoomFn: (userId: string, gatheringId: string) => boolean,
  ): Promise<void> {
    try {
      const targetUsers = await this.gatheringChatService.getUsersPushTokens(
        gatheringId,
        senderId,
      );

      const pushMessages: any[] = [];

      for (const user of targetUsers) {
        this.logger.debug(
          `[푸시 대상 검사] Target User ID: ${user.userId}, Token: ${user.pushToken}`,
        );

        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          continue;
        }

        // 현재 방에 접속 중인지 검사
        const isUserActiveInRoom = isUserInRoomFn(user.userId, gatheringId);
        this.logger.debug(
          `[방 접속 여부] User: ${user.userId}, Active: ${isUserActiveInRoom}`,
        );

        if (isUserActiveInRoom) {
          continue;
        }

        pushMessages.push({
          to: user.pushToken,
          sound: 'default',
          title: '새로운 채팅',
          body: message,
          priority: 'high',
          channelId: 'default',
          data: { gatheringId, type: 'CHAT' },
          android: {
            channelId: 'default',
            priority: 'high',
            sound: true,
            vibrate: true,
          },
        });
      }

      if (pushMessages.length === 0) return;

      const chunks = this.expo.chunkPushNotifications(pushMessages);
      for (const chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          this.logger.error('Expo 푸시 전송 실패:', error);
        }
      }
    } catch (err) {
      this.logger.error('푸시 알림 전송 에러:', err);
    }
  }
}
