import { Store } from "./Store";

export interface AdItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  store: Store;
}