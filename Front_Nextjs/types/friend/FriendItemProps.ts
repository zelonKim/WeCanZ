export interface FriendItemRowProps {
  item: any;
  t: any;
  renderAvatar: (uri?: string) => React.ReactNode;
  onRequestDm: (targetUserId: string, friend: any) => void;
  onBlockUser: (targetUserId: string) => void;
}
