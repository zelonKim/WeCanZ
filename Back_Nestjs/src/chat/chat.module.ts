import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { GatheringChatController } from './gathering-chat.controller';
import { GatheringChatService } from './gathering-chat.service';
import { DirectChatController } from './direct-chat.controller';
import { DirectChatService } from './direct-chat.service';
import { GatheringPushService } from './gathering-push.service';
import { DirectPushService } from './direct-push.service';

@Module({
  controllers: [GatheringChatController, DirectChatController],
  providers: [
    ChatGateway,
    GatheringChatService,
    DirectChatService,
    GatheringPushService,
    DirectPushService
  ],
})
export class ChatModule {}
