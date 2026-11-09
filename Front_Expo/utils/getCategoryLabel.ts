import { GatheringCategory } from "@/types/gathering/GatheringCategory";

export const getCategoryLabel = (t: any, cat: GatheringCategory) => {
  switch (cat) {
    case GatheringCategory.US:
      return t.us;
    case GatheringCategory.UK:
      return t.uk;
    case GatheringCategory.KR:
      return t.kr;
    default:
      return cat;
  }
};
