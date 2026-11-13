"use client";

import { AgreementModalTypes } from "@/types/auth/AgreementModalTypes";
import React from "react";

interface TermsModalProps {
  visible: boolean;
  type: AgreementModalTypes | null;
  onClose: () => void;
}

export default function TermsModal({
  visible,
  type,
  onClose,
}: TermsModalProps) {
  if (!visible) return null;

  const title =
    type === "terms" ? "📋 서비스 이용 약관" : "🔒 개인정보 처리 방침";

  const content =
    type === "terms"
      ? `제 1조 (목적)\n본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 온·오프라인 모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.\n\n제 2조 (금지 행위)\n1. 회원은 서비스 이용 시 타인을 비방하거나 성희롱, 욕설, 영리 목적의 홍보, 타인 사칭 등의 행위를 해서는 안 됩니다.\n2. 운영자는 위반 행위가 적발될 경우 사전 통보 없이 이용 정지 혹은 강제 탈퇴 등의 조치를 취할 수 있습니다.\n\n제 3조 (책임의 제한)\n1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 접촉 및 각종 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.\n2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.\n3. 플랫폼은 회원이 게시하거나 전송한 정보의 진위여부나 정확성에 대해 보증하지 않으며, 회원 간의 상호작용으로 인해 발생하는 손해에 대해 면책됩니다.`
      : `제 1조 (수집하는 개인정보 항목)\n본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.\n\n제 2조 (개인정보의 보유 및 이용 기간)\n수집된 개인정보는 회원 탈퇴 시 즉시 파기되는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보관이 필요한 경우 안전하게 분리 보관됩니다.\n\n제 3조 (개인정보의 파기 절차 및 방법)\n회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제됩니다.\n\n제 4조 (개인정보의 제3자 제공)\n본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[75vh] bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] p-6 flex flex-col shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4 text-center">
          {title}
        </h2>

        <div className="flex-1 overflow-y-auto my-1 pr-1 custom-scrollbar">
          <p className="text-sm text-[#B0B0B0] leading-relaxed whitespace-pre-line">
            {content}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer mt-4 w-full bg-[#bef408] py-3 rounded-xl text-gray-900 font-bold text-sm hover:opacity-90 transition"
        >
          확인
        </button>
      </div>
    </div>
  );
}
