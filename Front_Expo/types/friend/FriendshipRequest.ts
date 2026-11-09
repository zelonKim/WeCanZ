import { User } from "../user/User";
import { FriendshipStatus } from "./FriendshipStatus";

export interface FriendshipRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  sender: User;
}
