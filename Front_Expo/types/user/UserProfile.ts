export interface UserProfile {
  id: string;
  nickname: string;
  profileImage: string | null;
  noShowCount: number;
  yesShowCount: number;
}