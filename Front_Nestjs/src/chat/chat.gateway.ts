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


  @SubscribeMessage('sendDirectMessage')
  async handleSendDirectMessage(
    @MessageBody() data: { roomId: string; senderId: string; message: string },
  ) {
    const savedMessage = await this.directChatService.createMessage(
      data.roomId,
      data.senderId,
      data.message,
    );

    this.server
      .to(`direct_${data.roomId}`)
      .emit('newDirectMessage', savedMessage);

    return savedMessage;
  }
}
