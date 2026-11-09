import { DirectChatRoom } from "./DirectChatRoom";

export interface DMRoomItemProps {
  item: DirectChatRoom;
  styles: any;
  renderAvatar: (uri?: string) => React.ReactNode;

  onPressItem: (item: DirectChatRoom) => void;
  onLongPressItem: (roomId: string) => void;
}
