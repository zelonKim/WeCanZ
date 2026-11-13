"use client";

import { ImageViewerModalProps } from "@/types/DM/ImageViewerModalProps";
import { X } from "lucide-react";
import React from "react";

export const ImageViewerModal = ({
  imageUri,
  onClose,
}: ImageViewerModalProps) => {
  if (!imageUri) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] flex items-center justify-center">
        <img
          src={imageUri}
          alt="Full Screen View"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()} // 이미지 클릭 시 닫히는 것 방지
        />
      </div>
    </div>
  );
};
