import { User } from "../user/User";
import { UserProfile } from "../user/UserProfile";

export interface BlockManagementModalProps {
  visible: boolean;
  onClose: () => void;
  blockNickname: string;
  setBlockNickname: (text: string) => void;
  onBlockSubmit: () => void;
  blockedUsers: any[];
  isBlockedLoading: boolean;
  onRefreshBlocked: () => void;
  onUnblock: (targetUserId: string) => void;
  renderAvatar: (uri?: string) => React.ReactNode;
  t: any;
}
