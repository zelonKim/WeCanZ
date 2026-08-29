import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { DirectChatService } from './direct-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Body, Delete } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('direct-chat')
@UseGuards(JwtAuthGuard)
export class DirectChatController {
  constructor(private readonly directChatService: DirectChatService) {}

  // 1. DM 요청
  @Post('request/:targetUserId')
  createOrRequestRoom(
    @GetUser('id') myId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.directChatService.createOrRequestRoom(myId, targetUserId);
  }

  // 2. 나에게 들어온 DM 요청 목록 조회
  @Get('requests/pending')
  getPendingChatRequests(@GetUser('id') userId: string) {
    return this.directChatService.getPendingChatRequests(userId);
  }

  // 3. DM 요청 수락
  @Patch(':roomId/accept')
  acceptChatRequest(
    @GetUser('id') userId: string,
    @Param('roomId') roomId: string,
  ) {
    return this.directChatService.acceptChatRequest(roomId, userId);
  }

  // 4. DM 요청 거절
  @Patch(':roomId/reject')
  rejectChatRequest(
    @GetUser('id') userId: string,
    @Param('roomId') roomId: string,
  ) {
    return this.directChatService.rejectChatRequest(roomId, userId);
  }

  // 5. 내 DM 목록 조회
  @Get('rooms')
  getMyRooms(@GetUser('id') userId: string) {
    return this.directChatService.getMyRooms(userId);
  }

  // 6. 다이렉트 메시지 전송
  @Post('rooms/:roomId/messages')
  createMessage(
    @Param('roomId') roomId: string,
    @GetUser('id') senderId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.directChatService.createMessage(roomId, senderId, dto.message);
  }

  // 7. 다이렉트 메시지 조회
  @Get('rooms/:roomId/messages')
  getMessages(@GetUser('id') userId: string, @Param('roomId') roomId: string) {
    return this.directChatService.getMessages(roomId, userId);
  }

  // 8. 다이렉트 메시지 삭제
  @Delete('messages/:messageId')
  deleteMessage(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.directChatService.deleteMessage(messageId, userId);
  }

  // 9. DM 방 나가기
  @Delete('rooms/:roomId/leave')
  leaveRoom(@GetUser('id') userId: string, @Param('roomId') roomId: string) {
    return this.directChatService.leaveRoom(roomId, userId);
  }

  // 9. DM 방 조회
  @Get('rooms/:roomId')
  async getRoomById(
    @GetUser('id') userId: string,
    @Param('roomId') roomId: string,
  ) {
    //방 정보 반환
    return this.directChatService.getRoomById(roomId);
  }

  // 10. 최근 메시지 조회
  @Get('room/:roomId/last-message')
  async getLastMessage(@Param('roomId') roomId: string) {
    const lastMessage = await this.directChatService.getLastMessage(roomId);

    if (!lastMessage) {
      return {
        message: '삭제된 메시지입니다.',
        createdAt: new Date().toISOString(),
      };
    }

    return lastMessage;
  }
}
