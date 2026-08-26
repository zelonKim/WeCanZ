import { Controller, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { User } from '@prisma/client';


@Controller('participant')
@UseGuards(JwtAuthGuard)
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  // 1. 모임 참여 신청 
  @Post('apply/:gatheringId')
  applyGathering(@Param('gatheringId') gatheringId: string, @GetUser() user: User) {
    return this.participantService.applyGathering(gatheringId, user.id);
  }

  // 2. 참여자 승인 (방장 전용)
  @Patch(':participantId/approve')
  approveParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.approveParticipant(participantId, user.id);
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
  @Patch(':participantId/noshow')
  noShowParticipant(
    @Param('participantId') participantId: string,
    @GetUser() user: User,
  ) {
    return this.participantService.noShowParticipant(participantId, user.id);
  }
}