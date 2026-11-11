import { Participant } from "../user/Participant";
import { UserProfile } from "../user/UserProfile";

export interface GatheringDetailResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  hostId: string;
  host: UserProfile;
  participants: Participant[];
}
