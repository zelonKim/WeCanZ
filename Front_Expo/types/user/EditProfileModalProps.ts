export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profileImage: string;
  onImagePick: () => void;
  nickname: string;
  onChangeNickname: (text: string) => void;
  bio: string;
  onChangeBio: (text: string) => void;
  onSave: () => void;
  isPending: boolean;
  t: any;
  styles: any;
  Colors: any;
}