import { Module } from '@nestjs/common';
import { GatheringService } from './gathering.service';
import { GatheringController } from './gathering.controller';

@Module({
  controllers: [GatheringController],
  providers: [GatheringService],
})
export class GatheringModule {}
