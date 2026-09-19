import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectChatService } from './direct-chat.service';
import { GatheringChatService } from './gathering-chat.service';
import { FriendshipStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import Expo from 'expo-server-sdk';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private expo = new Expo();

  // 💡 1. 유저 접속 상태를 관리할 Map (Key: userId, Value: gatheringId)
  private activeUsers = new Map<string, string>();

  constructor(
    private readonly gatheringChatService: GatheringChatService,
    private readonly directChatService: DirectChatService,
    private readonly prisma: PrismaService,
  ) {}

  // 💡 2. 외부 및 내부에서 호출 가능한 방 접속 상태 확인 메서드
  isUserInRoom(userId: string, gatheringId: string): boolean {
    return this.activeUsers.get(userId) === gatheringId;
  }

  // 소켓 연결 해제 시 Map 정리
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.activeUsers.delete(userId);
    }
  }

  @SubscribeMessage('joinGatheringRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string; userId: string },
  ) {
    client.join(`gathering_${data.gatheringId}`);

    // 💡 소켓 객체 및 Map에 유저 접속 상태 등록
    if (data.userId) {
      client.data.userId = data.userId;
      this.activeUsers.set(data.userId, data.gatheringId);
    }

    return { event: 'joinedRoom', gatheringId: data.gatheringId };
  }

  @SubscribeMessage('leaveGatheringRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string; userId: string }, // 💡 userId 추가
  ) {
    client.leave(`gathering_${data.gatheringId}`);

    // 💡 Map에서 유저 접속 상태 제거
    if (data.userId) {
      this.activeUsers.delete(data.userId);
    }

    return { event: 'leftRoom', gatheringId: data.gatheringId };
  }

  @SubscribeMessage('sendGatheringMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      gatheringId: string;
      userId: string;
      message: string;
    },
  ) {
    const savedMessage = await this.gatheringChatService.createMessage(
      data.gatheringId,
      data.userId,
      data.message,
    );

    this.server
      .to(`gathering_${data.gatheringId}`)
      .emit('newGatheringMessage', {
        ...savedMessage,
        gatheringId: data.gatheringId,
      });

    this.sendGatheringPushNoti(
      data.gatheringId,
      data.userId,
      data.message,
    ).catch((err) => console.error('푸시 알림 전송 에러:', err));

    return savedMessage;
  }

  ///////////////////////////////////////////

  private async sendGatheringPushNoti(
    gatheringId: string,
    senderId: string,
    message: string,
  ) {
    const targetUsers = await this.gatheringChatService.getUsersPushTokens(
      gatheringId,
      senderId,
    );

    const pushMessages: any[] = [];

    for (const user of targetUsers) {
      if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
        continue;
      }

      const isUserActiveInRoom = this.isUserInRoom(user.userId, gatheringId);

      if (isUserActiveInRoom) {
        continue;
      }

      pushMessages.push({
        to: user.pushToken,
        sound: 'default' as const,
        title: '새로운 채팅',
        body: message,
        priority: 'high',
        channelId: 'default',
        data: { gatheringId, type: 'CHAT' },
      });
    }

    const chunks = this.expo.chunkPushNotifications(pushMessages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Expo 푸시 전송 실패:', error);
      }
    }
  }

  ///////////////////////////////////////////

  @SubscribeMessage('deleteGatheringMessage')
  async handleDeleteMessage(
    @MessageBody()
    data: {
      gatheringId: string;
      messageId: string;
      userId: string;
    },
  ) {
    await this.gatheringChatService.deleteMessage(data.messageId, data.userId);

    this.server
      .to(`gathering_${data.gatheringId}`)
      .emit('gatheringMessageDeleted', { messageId: data.messageId });
  }

  ////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('joinDirectRoom')
  handleJoinDirectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(`direct_${data.roomId}`);
    return { event: 'joinedDirectRoom', roomId: data.roomId };
  }

  @SubscribeMessage('leaveDirectRoom')
  handleLeaveDirectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`direct_${data.roomId}`);
    return { event: 'leftDirectRoom', roomId: data.roomId };
  }

  // 💡 [추가] 유저 개인 룸 입장 (DM 목록 실시간 업데이트 수신용)
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      client.join(`user_${data.userId}`);
      console.log(
        `[Socket] Client ${client.id} joined user room: user_${data.userId}`,
      );
      return { event: 'joinedUserRoom', userId: data.userId };
    }
  }

  // 💡 [추가] 유저 개인 룸 퇴장
  @SubscribeMessage('leaveUserRoom')
  handleLeaveUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      client.leave(`user_${data.userId}`);
      return { event: 'leftUserRoom', userId: data.userId };
    }
  }

  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @MessageBody() data: { roomId: string; senderId: string; message: string },
  ) {
    try {
      // 1. 방 정보 조회 및 상대방(수신자) ID 판별
      const room = await this.directChatService.getRoomById(data.roomId);
      if (!room) return;

      const receiverId =
        room.user1Id === data.senderId ? room.user2Id : room.user1Id;

      if (!receiverId) {
        return;
      }

      // 2. 상대방(receiver)이 나(sender)를 차단했는지 확인
      const isBlockedByReceiver = await this.prisma.friendship.findFirst({
        where: {
          senderId: receiverId, // 상대방이
          receiverId: data.senderId, // 나를 차단함
          status: FriendshipStatus.BLOCKED,
        },
      });

      // 🚨 3. 상대방이 나를 차단한 경우: 가짜 성공 응답 처리 (DB 저장 X, 상대방 알림 X)
      if (isBlockedByReceiver) {
        const fakeSavedMessage = {
          id: `temp-${Date.now()}`,
          roomId: data.roomId,
          senderId: data.senderId,
          message: data.message,
          createdAt: new Date().toISOString(),
        };

        // 보낸 사람 본인에게만 메시지 전송 이벤트 전달 (정상 전송된 것처럼 보임)
        this.server
          .to(`user_${data.senderId}`)
          .emit('newDirectMessage', fakeSavedMessage);

        // 보낸 사람 본인에게만 DM 목록 갱신 이벤트 전달
        this.server.to(`user_${data.senderId}`).emit('dmListUpdated', {
          roomId: data.roomId,
          lastMessage: {
            content: data.message,
            createdAt: fakeSavedMessage.createdAt,
          },
          senderId: data.senderId,
        });

        return fakeSavedMessage;
      }

      // 4. 차단되지 않은 경우: 정상 로직 수행 (DB 저장 및 전체 방송)
      const savedMessage = await this.directChatService.createMessage(
        data.roomId,
        data.senderId,
        data.message,
      );

      // 채팅방 내부 유저들에게 실시간 메시지 전송
      this.server
        .to(`direct_${data.roomId}`)
        .emit('newDirectMessage', savedMessage);

      // DM 목록 갱신용 데이터
      const updatePayload = {
        roomId: data.roomId,
        lastMessage: {
          content: savedMessage.message,
          createdAt: savedMessage.createdAt,
        },
        senderId: data.senderId,
      };

      // 양쪽 모두에게 목록 갱신 이벤트 전달
      this.server.to(`user_${receiverId}`).emit('dmListUpdated', updatePayload);
      this.server
        .to(`user_${data.senderId}`)
        .emit('dmListUpdated', updatePayload);

      return savedMessage;
    } catch (error) {
      console.error('[Socket Error] handleSendDirectMessage:', error);
      throw error;
    }
  }

  @SubscribeMessage('deleteDirectMessage')
  async handleDeleteDirectMessage(
    @MessageBody()
    data: {
      roomId: string;
      messageId: string;
      userId: string;
    },
  ) {
    try {
      // 1. 방 정보 조회 및 상대방(수신자) ID 판별
      const room = await this.directChatService.getRoomById(data.roomId);
      if (!room) return;

      const receiverId =
        room.user1Id === data.userId ? room.user2Id : room.user1Id;

      if (!receiverId) {
        return;
      }

      // 2. 양방향 차단 여부 확인 (내가 상대를 차단했거나 OR 상대가 나를 차단했거나)
      const isBlockedRelation = await this.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              senderId: data.userId,
              receiverId,
              status: FriendshipStatus.BLOCKED,
            },
            {
              senderId: receiverId,
              receiverId: data.userId,
              status: FriendshipStatus.BLOCKED,
            },
          ],
        },
      });

      // 🚨 차단 관계라면 메시지 삭제 금지 처리
      if (isBlockedRelation) {
        // 소켓 에러 이벤트를 던지거나 조용히 마감 처리
        return;
      }

      // 3. DB 삭제 완료를 반드시 기다림 (await 필수)
      await this.directChatService.deleteMessage(data.messageId, data.userId);

      // 4. 대화방 내부 삭제 이벤트 통보
      this.server
        .to(`direct_${data.roomId}`)
        .emit('directMessageDeleted', { messageId: data.messageId });

      // 5. 삭제 완료 후 최신 메시지 다시 조회
      const lastMsg = await this.directChatService.getLastMessage(data.roomId);

      // 6. payload 생성 (content 키값 맞춤)
      const lastMessagePayload = lastMsg
        ? { content: lastMsg.message, createdAt: lastMsg.createdAt }
        : {
            content: '삭제된 메시지입니다.',
            createdAt: new Date().toISOString(),
          };

      const dmListPayload = {
        roomId: data.roomId,
        lastMessage: lastMessagePayload,
        senderId: data.userId,
      };

      // 7. 방 참여자들에게 DM 목록 업데이트 전송
      this.server
        .to(`user_${room.user1Id}`)
        .emit('dmListUpdated', dmListPayload);
      this.server
        .to(`user_${room.user2Id}`)
        .emit('dmListUpdated', dmListPayload);
    } catch (error) {
      console.error('[Socket Error] handleDeleteDirectMessage:', error);
      throw error;
    }
  }
}
