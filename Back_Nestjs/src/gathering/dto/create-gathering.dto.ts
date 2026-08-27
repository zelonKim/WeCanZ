import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GatheringCategory } from '@prisma/client';

export class CreateGatheringDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(GatheringCategory)
  category: GatheringCategory;

  @IsNumber()
  maxPeople: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsDateString({}, { message: '올바른 날짜 형식이어야 합니다.' })
  dateTime: string;
}
