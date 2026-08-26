import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { GatheringChatController } from './gathering-chat.controller';
import { GatheringChatService } from './gathering-chat.service';
import { DirectChatController } from './direct-chat.controller'; 
import { DirectChatService } from './direct-chat.service'; 

@Module({
  controllers: [GatheringChatController, DirectChatController],
  providers: [ChatGateway, GatheringChatService, DirectChatService],
})
export class ChatModule {}
