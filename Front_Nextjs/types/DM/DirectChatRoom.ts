import { User } from "../user/User";

export interface DirectChatRoom {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user1Id: string;
  user2Id: string;
  user1?: User;
  user2?: User;
  sender?: User;
  targetUser?: User;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  hasUnread?: boolean;
}
