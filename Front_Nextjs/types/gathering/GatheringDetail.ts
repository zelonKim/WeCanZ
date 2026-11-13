import { UserProfile } from "../user/UserProfile";
import { GatheringCategory } from "./GatheringCategory";
import { GatheringStatus } from "./GatheringStatus";

import { ParticipantStatus } from "./ParticipantStatus";

export interface GatheringDetail {
  id: string;
  title: string;
  description: string;
  category: GatheringCategory;
  maxPeople: number;
  location: string;
  dateTime: string;
  status: GatheringStatus;
  roomCode?: string;
  hostId: string;
  host?: UserProfile;
  participants: {
    id: string;
    userId: string;
    status: ParticipantStatus;
    user: UserProfile;
    gatheringId: string;
  }[];
}
