import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdateReportStatusDto {
  @IsNotEmpty()
  @IsEnum(ReportStatus)
  status!: ReportStatus; 
}