export interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  friendNickname: string;
  setFriendNickname: (text: string) => void;
  onSubmit: () => void;
  t: any;

}
