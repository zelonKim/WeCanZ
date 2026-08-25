import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { GatheringChatController } from './gathering-chat.controller';
import { GatheringChatService } from './gathering-chat.service';

@Module({
  controllers: [GatheringChatController],
  providers: [ChatGateway, ChatService, GatheringChatService],
})
export class ChatModule {}
