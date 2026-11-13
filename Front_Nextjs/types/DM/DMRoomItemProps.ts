import { DirectChatRoom } from "./DirectChatRoom";

export interface DMRoomItemProps {
  item: DirectChatRoom;
  renderAvatar: (uri?: string) => React.ReactNode;
  onPressItem: (item: DirectChatRoom) => void;
  onLongPressItem: (roomId: string) => void;
  lang: string;
}
