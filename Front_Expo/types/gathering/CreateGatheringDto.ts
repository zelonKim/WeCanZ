import { GatheringCategory } from "./GatheringCategory";

export interface CreateGatheringDto {
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  dateTime: string;
}
