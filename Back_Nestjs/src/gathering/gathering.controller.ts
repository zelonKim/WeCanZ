import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GatheringService } from './gathering.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('gathering')
@UseGuards(JwtAuthGuard)
export class GatheringController {
  constructor(private readonly gatheringService: GatheringService) {}

  // 1. 모임 생성
  @Post()
  create(
    @GetUser() user: User,
    @Body() createGatheringDto: CreateGatheringDto,
  ) {
    return this.gatheringService.createGathering(user.id, createGatheringDto);
  }

  // 2-1. 모임 전체 조회
  @Get()
  findAll() {
    return this.gatheringService.findAllGathering();
  }

  // 2-2. 나의 모임 조회
  @Get('my')
  async getMyGatherings(@GetUser() user: User) {
    return await this.gatheringService.getMyGatherings(user.id);
  }

  // 3. 모임 상세 조회
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gatheringService.findOneGathering(id);
  }

  // 4. 모임 수정
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateGatheringDto: UpdateGatheringDto,
  ) {
    return this.gatheringService.updateGathering(
      id,
      user.id,
      updateGatheringDto,
    );
  }

  // 5. 모임 시작 (방장 전용)
  @Patch(':id/start')
  startGathering(@Param('id') gatheringId: string, @GetUser() user: User) {
    return this.gatheringService.startGathering(gatheringId, user.id);
  }

  // 6. 모임 종료 (방장 전용)
  @Patch(':id/complete')
  completeGathering(
    @Param('id') gatheringId: string,
    @GetUser('id') hostId: string,
  ) {
    return this.gatheringService.completeGathering(gatheringId, hostId);
  }

  // 7. 모임 취소 (방장 전용)
  @Patch(':id/cancel')
  cancelGathering(
    @Param('id') gatheringId: string,
    @GetUser('id') hostId: string,
  ) {
    return this.gatheringService.cancelGathering(gatheringId, hostId);
  }
}
