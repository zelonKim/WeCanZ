import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { GatheringChatService } from './gathering-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import type { User } from '@prisma/client';


@Controller('gathering-chat')
@UseGuards(JwtAuthGuard)
export class GatheringChatController {
  constructor(private readonly gatheringChatService: GatheringChatService) {}

  // 1. 모임 메시지 목록 조회
  @Get(':gatheringId/messages')
  getMessages(
    @Param('gatheringId') gatheringId: string,
    @GetUser() user: User,
  ) {
    return this.gatheringChatService.getMessages(gatheringId, user.id);
  }

  // 2. 모임 메시지 전송
  @Post(':gatheringId/messages')
  createMessage(
    @Param('gatheringId') gatheringId: string,
    @GetUser() user: User,
    @Body() dto: CreateChatDto,
  ) {
    return this.gatheringChatService.createMessage(gatheringId, user.id, dto);
  }

  // 3. 모임 메시지 삭제
  @Delete('messages/:messageId')
  deleteMessage(@Param('messageId') messageId: string, @GetUser() user: User) {
    return this.gatheringChatService.deleteMessage(messageId, user.id);
  }
}
