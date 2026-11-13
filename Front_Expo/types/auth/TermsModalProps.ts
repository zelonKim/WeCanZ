import { AgreementModalTypes } from "./AgreementModalTypes";

export interface TermsModalProps {
  visible: boolean;
  type: AgreementModalTypes | null;
  onClose: () => void;
}
