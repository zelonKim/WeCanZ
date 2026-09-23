import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  reportedUserId!: string;

  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsString()
  details!: string;
}
