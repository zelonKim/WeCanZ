export interface ChatMessage {
  id: string;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    nickname?: string;
    profileImage?: string | null;
  };
}
