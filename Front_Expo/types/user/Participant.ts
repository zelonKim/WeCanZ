import { ParticipantStatus } from "../gathering/ParticipantStatus";
import { UserProfile } from "./UserProfile";

export interface Participant {
  id: string;
  userId: string;
  gatheringId: string;
  user: UserProfile;
  status: ParticipantStatus;
}
