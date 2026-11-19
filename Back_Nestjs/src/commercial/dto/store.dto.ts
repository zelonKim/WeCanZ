import { PartialType } from '@nestjs/mapped-types';

export class CreateStoreDto {
  name!: string;
  address!: string;
  openTime!: string;
  closeTime!: string;
  imageUrl?: string;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
