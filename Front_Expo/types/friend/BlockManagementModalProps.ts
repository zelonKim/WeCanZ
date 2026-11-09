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
  Colors: any;
  t: any;
  styles: any;
}
