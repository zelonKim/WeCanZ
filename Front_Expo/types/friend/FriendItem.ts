import { User } from "../user/User";
import { FriendshipStatus } from "./FriendshipStatus";

export interface FriendItem {
  id: string;
  friendUser: User;
  status: FriendshipStatus;
}
