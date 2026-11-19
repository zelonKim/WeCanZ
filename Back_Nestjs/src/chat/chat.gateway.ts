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
import { GatheringPushService } from './gathering-push.service';
import { DirectPushService } from './direct-push.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private activeUserGC = new Map<string, string>();
  private activeUserDM = new Map<string, string>();

  constructor(
    private readonly gatheringChatService: GatheringChatService,
    private readonly directChatService: DirectChatService,
    private readonly gatheringPushService: GatheringPushService,
    private readonly directPushService: DirectPushService,
    private readonly prisma: PrismaService,
  ) {}

  ///////////////////////////////////////////////////////////////////////////

  isUserInGatheringRoom(userId: string, roomId: string): boolean {
    return this.activeUserGC.get(userId) === roomId;
  }

  isUserInDirectRoom(userId: string, roomId: string): boolean {
    return this.activeUserDM.get(userId) === roomId;
  }

  ///////////////////////////////////////////////////////////////////////////

  handleDisconnect(client: Socket) {
    const GCuserId = client.data?.userGCId;
    const DMuserId = client.data?.userDMId;

    if (GCuserId) {
      this.activeUserGC.delete(GCuserId);
    }

    if (DMuserId) {
      this.activeUserDM.delete(DMuserId);
    }
  }

  ///////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('joinGatheringRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string; userId: string },
  ) {
    client.join(`gathering_${data.gatheringId}`);

    // 소켓 객체 및 Map에 유저 접속 상태 등록
    if (data.userId) {
      client.data.GCuserId = data.userId;
      this.activeUserGC.set(data.userId, data.gatheringId);
    }

    return { event: 'joinedRoom', gatheringId: data.gatheringId };
  }

  ///////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('leaveGatheringRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string; userId: string },
  ) {
    client.leave(`gathering_${data.gatheringId}`);

    // Map에서 유저 접속 상태 제거
    if (data.userId) {
      this.activeUserGC.delete(data.userId);
    }

    return { event: 'leftRoom', gatheringId: data.gatheringId };
  }

  ///////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('sendGatheringMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      gatheringId: string;
      userId: string;
      message: string;
      imageUrl?: string;
    },
  ) {
    const savedMessage = await this.gatheringChatService.createMessage(
      data.gatheringId,
      data.userId,
      data.message,
      data.imageUrl,
    );

    this.server
      .to(`gathering_${data.gatheringId}`)
      .emit('newGatheringMessage', {
        ...savedMessage,
        gatheringId: data.gatheringId,
      });

    this.gatheringPushService
      .sendGatheringPushNoti(
        data.gatheringId,
        data.userId,
        data.message,
        (userId, gId) => this.isUserInGatheringRoom(userId, gId),
      )
      .catch((err) => console.error('푸시 알림 전송 에러:', err));

    return savedMessage;
  }

  ///////////////////////////////////////////////////////////////////////////

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
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.join(`direct_${data.roomId}`);

    // 소켓 객체 및 Map에 유저 접속 상태 등록
    if (data.userId) {
      client.data.DMuserId = data.userId;
      this.activeUserDM.set(data.userId, data.roomId);
    }

    return { event: 'joinedDirectRoom', roomId: data.roomId };
  }

  ///////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('leaveDirectRoom')
  handleLeaveDirectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    client.leave(`direct_${data.roomId}`);

    if (data.userId) {
      this.activeUserDM.delete(data.userId);
    }

    return { event: 'leftDirectRoom', roomId: data.roomId };
  }

  ///////////////////////////////////////////////////////////////////////////

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

  ///////////////////////////////////////////////////////////////////////////

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

  ///////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @MessageBody()
    data: {
      roomId: string;
      senderId: string;
      message: string;
      imageUrl?: string;
    },
  ) {
    try {
      //  방 정보 조회 및 상대방(수신자) ID 판별
      const room = await this.directChatService.getRoomById(data.roomId);
      if (!room) return;

      const receiverId =
        room.user1Id === data.senderId ? room.user2Id : room.user1Id;

      if (!receiverId) {
        return;
      }

      // 상대방(receiver)이 나(sender)를 차단했는지 확인
      const isBlockedByReceiver = await this.prisma.friendship.findFirst({
        where: {
          senderId: receiverId,
          receiverId: data.senderId,
          status: FriendshipStatus.BLOCKED,
        },
      });

      //  상대방이 나를 차단한 경우: 가짜 성공 응답 처리
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

      // 차단되지 않은 경우: 정상 로직 수행 (DB 저장 및 전체 방송)
      const savedMessage = await this.directChatService.createMessage(
        data.roomId,
        data.senderId,
        data.message,
        data.imageUrl,
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

      this.directPushService
        .sendDMPushNoti(
          data.roomId,
          data.senderId,
          data.message,
          (userId, rId) => this.isUserInDirectRoom(userId, rId),
        )
        .catch((err) => console.error('DM 푸시 알림 전송 에러:', err));

      return savedMessage;
    } catch (error) {
      console.error('[Socket Error] handleSendDirectMessage:', error);
      throw error;
    }
  }

  ///////////////////////////////////////////////////////////////////////////

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
      // 방 정보 조회 및 상대방(수신자) ID 판별
      const room = await this.directChatService.getRoomById(data.roomId);
      if (!room) return;

      const receiverId =
        room.user1Id === data.userId ? room.user2Id : room.user1Id;

      if (!receiverId) {
        return;
      }

      // 양방향 차단 여부 확인
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

      if (isBlockedRelation) {
        return;
      }

      //  DB 삭제 완료를 반드시 기다림
      await this.directChatService.deleteMessage(data.messageId, data.userId);

      //  대화방 내부 삭제 이벤트 통보
      this.server
        .to(`direct_${data.roomId}`)
        .emit('directMessageDeleted', { messageId: data.messageId });

      // 삭제 완료 후 최신 메시지 다시 조회
      const lastMsg = await this.directChatService.getLastMessage(data.roomId);

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

      // 방 참여자들에게 DM 목록 업데이트 전송
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
