import { IsEnum } from 'class-validator';
import { ParticipantStatus } from '@prisma/client';

export class ChangeStatusDto {
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;
}