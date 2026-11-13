"use client";

import { User } from "lucide-react";
import React from "react";

export const renderAvatar = (profileImage?: string | null) => {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt="Avatar"
        className="w-11 h-11 rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400">
      <User className="w-5 h-5" />
    </div>
  );
};
