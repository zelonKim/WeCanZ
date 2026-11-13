import { GatheringCategory } from "./GatheringCategory";

export interface Gathering {
  id: string;
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  latitude?: number;
  longitude?: number;
  dateTime: string;
  status: string;
  createdAt: string;
  hostId: string;
  host: {
    nickname: string;
    profileImage: string;
  };
}
