import { Module } from '@nestjs/common';
import { GatheringService } from './gathering.service';
import { GatheringController } from './gathering.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [GatheringController],
  providers: [GatheringService],
})
export class GatheringModule {}
