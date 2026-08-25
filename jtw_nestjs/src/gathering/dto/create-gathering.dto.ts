import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GatheringCategory } from '@prisma/client';

export class CreateGatheringDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(GatheringCategory)
  category: GatheringCategory;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNumber()
  maxPeople: number;
}