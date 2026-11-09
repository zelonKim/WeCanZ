import { User } from "./User";

export interface BlockedUserItem {
  id: string;
  receiver?: User;
  nickname?: string;
  profileImage?: string;
}
