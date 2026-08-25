import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

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
    @MessageBody() data: { gatheringId: string; userId: string; message: string },
  ) {
    const savedMessage = await this.chatService.saveGatheringMessage(
      data.gatheringId,
      data.userId,
      data.message,
    );

    this.server
      .to(`gathering_${data.gatheringId}`)
      .emit('newGatheringMessage', savedMessage);

    return savedMessage;
  }
}