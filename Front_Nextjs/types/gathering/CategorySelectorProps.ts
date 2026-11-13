export interface CategorySelectorProps {
  category: string;
  onSelectCategory: (val: any) => void;
  options: { label: string; value: any }[];
  label: string;
}
