export interface SearchUserModalProps {
  visible: boolean;
  onClose: () => void;
  searchNickname: string;
  onChangeSearchNickname: (text: string) => void;
  onSearch: () => void;
  t: any;
  styles: any;
}
