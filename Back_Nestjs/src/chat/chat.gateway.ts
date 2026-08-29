import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectChatService } from './direct-chat.service';
import { GatheringChatService } from './gathering-chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gatheringChatService: GatheringChatService,
    private readonly directChatService: DirectChatService,
  ) {}

  @SubscribeMessage('joinGatheringRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string },
  ) {
    client.join(`gathering_${data.gatheringId}`);
    return { event: 'joinedRoom', gatheringId: data.gatheringId };
  }

  @SubscribeMessage('leaveGatheringRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gatheringId: string },
  ) {
    client.leave(`gathering_${data.gatheringId}`);
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
      .emit('newGatheringMessage', savedMessage);

    return savedMessage;
  }

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
      // 1. 메시지 DB 저장
      const savedMessage = await this.directChatService.createMessage(
        data.roomId,
        data.senderId,
        data.message,
      );

      // 2. 현재 대화방 안에 있는 유저들에게 메시지 전송 (채팅방 화면용)
      this.server
        .to(`direct_${data.roomId}`)
        .emit('newDirectMessage', savedMessage);

      // 3. 방 정보 조회 후 상대방(수신자) ID 판별
      const room = await this.directChatService.getRoomById(data.roomId);
      if (!room) return savedMessage;

      const receiverId =
        room.user1Id === data.senderId ? room.user2Id : room.user1Id;

      // 4. 상대방 개인 룸 및 내 개인 룸으로 목록 갱신 이벤트 전송 (DM 목록 화면용)
      const updatePayload = {
        roomId: data.roomId,
        lastMessage: {
          content: savedMessage.message,
          createdAt: savedMessage.createdAt,
        },
        senderId: data.senderId,
      };

      console.log(
        `[Socket] Emitting dmListUpdated to user_${receiverId} & user_${data.senderId}`,
      );

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
    // 1. DB 삭제 완료를 반드시 기다림 (await 필수)
    await this.directChatService.deleteMessage(data.messageId, data.userId);

    // 2. 대화방 내부 삭제 이벤트 통보
    this.server
      .to(`direct_${data.roomId}`)
      .emit('directMessageDeleted', { messageId: data.messageId });

    // 3. 삭제 완료 후 최신 메시지 다시 조회
    const lastMsg = await this.directChatService.getLastMessage(data.roomId);
    const room = await this.directChatService.getRoomById(data.roomId);

    // 4. payload 생성 (content 키값 맞춤)
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

    // 5. 방 참여자들에게 DM 목록 업데이트 전송
    if (room) {
      this.server
        .to(`user_${room.user1Id}`)
        .emit('dmListUpdated', dmListPayload);
      this.server
        .to(`user_${room.user2Id}`)
        .emit('dmListUpdated', dmListPayload);
    }
  }
}
