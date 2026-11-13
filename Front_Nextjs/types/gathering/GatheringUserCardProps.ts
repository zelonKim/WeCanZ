import { UserProfile } from "../user/UserProfile";

export interface GatheringUserCardProps {
  user?: UserProfile;
  roleTag?: string;
  participantId?: string;
  currentStatus?: "APPROVED" | "PENDING";
  me?: { id: string };
  gathering?: { hostId: string; status: string };
  isHost: boolean;
  activeMenuUserId: string | null;
  setActiveMenuUserId: (id: string | null) => void;
  handleCloseMenu: () => void;
  sendFriendRequestMutation: (userId: string) => void;
  requestDmMutation: (userId: string) => void;
  blockUserMutation: (userId: string) => void;
  pendingMutation: (participantId: string) => void;
  approveMutation: (participantId: string) => void;
  banMutation: (participantId: string) => void;
}
