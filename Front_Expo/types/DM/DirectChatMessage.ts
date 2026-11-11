import { User } from "../user/User";

export interface DirectChatMessage {
  id: string;
  message: string;
  createdAt: string;
  imageUrl: string;
  roomId: string;
  senderId: string;
  sender?: User;
}
