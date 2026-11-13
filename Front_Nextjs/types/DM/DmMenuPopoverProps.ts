export interface DmMenuPopoverProps {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onNavigateProfile: (partnerId: string) => void;
  onSendFriendRequest: (partnerId: string) => void;
  onBlockUser: (partnerId: string) => void;
}
