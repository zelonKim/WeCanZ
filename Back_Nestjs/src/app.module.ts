import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GatheringModule } from './gathering/gathering.module';
import { ParticipantModule } from './participant/participant.module';
import { ChatModule } from './chat/chat.module';
import { FriendshipModule } from './friendship/friendship.module';
import { ReportModule } from './report/report.module';
import { CommercialModule } from './commercial/commercial.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    GatheringModule,
    ParticipantModule,
    ChatModule,
    FriendshipModule,
    ReportModule,
    CommercialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
