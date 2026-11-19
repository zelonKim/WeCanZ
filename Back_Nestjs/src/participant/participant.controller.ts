import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('participant')
@UseGuards(JwtAuthGuard)
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  // 1-1. 모임 참여 신청
  @Post('apply/:gatheringId')
  applyGathering(
    @Param('gatheringId') gatheringId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.applyGathering(gatheringId, user.id);
  }

  // 1-2. 모임 참여 취소
  @Delete('cancel/:gatheringId')
  cancelGathering(
    @Param('gatheringId') gatheringId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.cancelGathering(gatheringId, user.id);
  }

  // 2-1. 참여자 승인 (방장 전용)
  @Patch(':participantId/approve')
  approveParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.approveParticipant(participantId, user.id);
  }

  // 2-2. 참여자 대기 (방장 전용)
  @Patch(':participantId/pending')
  pendingParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.pendingParticipant(participantId, user.id);
  }

  // 3. 참여자 강퇴 (방장 전용)
  @Patch(':participantId/ban')
  banParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.banParticipant(participantId, user.id);
  }

  // 4. 노쇼 처리 (방장 전용)
  @Patch(':participantId/no-show')
  noShowParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.noShowParticipant(participantId, user.id);
  }

  // 5. 예스쇼 처리 (방장 전용)
  @Patch(':participantId/yes-show')
  yesShowParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.yesShowParticipant(participantId, user.id);
  }

  // 6. 채팅방 읽음 처리
  @Patch('read/:gatheringId')
  async updateLastRead(
    @GetUser() user: User,
    @Param('gatheringId') gatheringId: string,
  ) {
    return await this.participantService.updateLastRead(user.id, gatheringId);
  }

}
