import { GatheringStatus } from "./GatheringStatus";
import { ParticipantStatus } from "./ParticipantStatus";

export interface MyGathering {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dateTime?: string;
  hostId: string;
  status: GatheringStatus;
  participants?: {
    userId: string;
    status: ParticipantStatus;
  }[];
}
