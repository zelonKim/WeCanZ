import { PartnerUser } from "../user/PartnerUser";

export interface DMRoomInfoResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user1Id: string | null;
  user2Id: string | null;
  partner?: PartnerUser;
}
