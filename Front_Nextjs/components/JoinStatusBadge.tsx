import { MyGathering } from "@/types/gathering/MyGathering";
import { MyInfo } from "@/types/user/MyInfo";
import React from "react";

interface JoinStatusBadgeProps {
  item: MyGathering;
  me: MyInfo;
  t: any;
}

export const JoinStatusBadge: React.FC<JoinStatusBadgeProps> = ({
  item,
  me,
  t,
}) => {
  const baseStyle =
    "px-2.5 py-1 rounded-xl inline-flex items-center justify-center text-[11px] font-extrabold shrink-0";

  if (String(item.hostId) === String(me?.id)) {
    return (
      <span className={`${baseStyle} bg-[#bef408]/15 text-[#bef408]`}>
        {t.badgeHost}
      </span>
    );
  }

  const myParticipant = item.participants?.find(
    (p) => String(p.userId) === String(me?.id),
  );

  if (myParticipant?.status === "APPROVED") {
    return (
      <span className={`${baseStyle} bg-green-500/15 text-[#4ADE80]`}>
        {t.badgeApproved}
      </span>
    );
  }

  if (myParticipant?.status === "PENDING") {
    return (
      <span className={`${baseStyle} bg-orange-500/15 text-[#FB923C]`}>
        {t.badgePending}
      </span>
    );
  }

  return null;
};
