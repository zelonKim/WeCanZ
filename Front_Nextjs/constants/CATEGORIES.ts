import { GatheringCategory } from "@/types/gathering/GatheringCategory";

export const CATEGORIES = (t: any) => [
    { label: t.all, value: "ALL" },
    { label: t.us, value: GatheringCategory.US },
    { label: t.uk, value: GatheringCategory.UK },
    { label: t.kr, value: GatheringCategory.KR },
  ];