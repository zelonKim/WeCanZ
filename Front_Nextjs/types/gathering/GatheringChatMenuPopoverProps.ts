export interface GatheringChatMenuPopoverProps {
  msg: any;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onRequestDm: (userId: string) => void;
  onBlockUser: (userId: string, nickname?: string) => void;
}
