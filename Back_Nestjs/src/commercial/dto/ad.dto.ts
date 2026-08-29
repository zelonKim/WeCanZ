import { PartialType } from '@nestjs/mapped-types';

export class CreateAdDto {
  title!: string;
  content!: string;
  storeId!: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate!: string | Date;
  endDate!: string | Date;
  isActive?: boolean;
}

export class UpdateAdDto extends PartialType(CreateAdDto) {}