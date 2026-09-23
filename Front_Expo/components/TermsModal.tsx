import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TermsModalProps {
  visible: boolean;
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

interface Section {
  title: string;
  body: string;
}

// 1. 서비스 이용약관 데이터
const TERMS_SECTIONS: Section[] = [
  {
    title: "제 1조 (목적)",
    body: "본 플랫폼은 만 19세 이상의 성인들을 대상으로 하며, 사용자들이 온·오프라인 소모임을 편리하게 개설하고 참여할 수 있도록 커뮤니티 및 모임 중개 서비스를 제공하는 것을 목적으로 합니다.",
  },
  {
    title: "제 2조 (부적절한 콘텐츠 및 악성 사용자에 대한 무관용 원칙)",
    body: "본 서비스는 불쾌하거나 부적절한 콘텐츠(UGC) 및 이를 유포하는 악성 사용자에 대해 절대 용납하지 않는 무관용 정책(Zero-Tolerance Policy)을 엄격히 적용합니다.\n\n다음 각 호의 행위는 엄격히 금지됩니다:\n- 음란물, 성희롱, 혐오 발언, 비속어, 폭력적 표현 작성\n- 타인 비방, 명예훼손, 사칭, 개인정보 유출 행위\n- 스팸, 영리 목적의 불법 광고 및 사기 행위",
  },
  {
    title: "제 3조 (신고 및 차단, 모니터링 시스템)",
    body: "1. 신고 기능: 회원은 부적절한 게시글, 메시지 또는 사용자를 발견할 경우 앱 내 <신고> 버튼을 통해 즉시 관리자에게 접수할 수 있습니다.\n\n2. 차단 기능: 회원은 원치 않는 사용자를 언제든지 <차단>할 수 있으며, 차단 처리 즉시 해당 사용자의 프로필, 게시물 및 대화 내용이 피드와 채팅방에서 숨겨집니다.\n\n3. '24시간' 내 조치: 운영진은 신고 접수 후 24시간 이내에 해당 콘텐츠를 검토하고, 위반이 확인될 경우 적절한 삭제 조치 및 해당 사용자의 이용을 제한(강제 탈퇴 등)합니다.",
  },
  {
    title: "제 4조 (책임의 제한)",
    body: "1. 본 플랫폼은 회원 간의 자유로운 모임 개설 및 참여를 위한 중개 플랫폼으로서, 모임 과정에서 발생하는 회원 간의 대화, 오프라인 만남, 신체적·물리적 충돌 및 직동 분쟁에 대해 어떠한 법적 책임도 지지 않습니다.\n\n2. 모임 참여 중 발생하는 안전사고, 금전적 손해, 형사적 사건·사고 등 모든 책임은 당사자 본인에게 있으며, 플랫폼 운영자는 이에 대해 고의나 중대한 과실이 없는 한 책임을 부담하지 않습니다.",
  },
];

// 2. 개인정보 처리방침 데이터
const PRIVACY_SECTIONS: Section[] = [
  {
    title: "제 1조 (수집하는 개인정보 항목)",
    body: "본 서비스는 회원가입 및 원활한 모임 중개 서비스 제공을 위해 최소한의 개인정보(닉네임, 이메일, 프로필 이미지 등)를 수집합니다.",
  },
  {
    title: "제 2조 (개인정보의 보유 및 이용 기간)",
    body: "수집된 개인정보는 회원 탈퇴 시 즉시 파기하는 것을 원칙으로 하며, 관계 법령에 따라 일정 기간 보존이 필요한 경우 안전하게 분리 보관합니다.",
  },
  {
    title: "제 3조 (개인정보의 파기 절차 및 방법)",
    body: "회원 탈퇴 등 파기 사유가 발생한 개인정보는 복구할 수 없는 기술적 방법을 사용하여 안전하게 삭제합니다.",
  },
  {
    title: "제 4조 (개인정보의 제3자 제공)",
    body: "본 플랫폼은 이용자의 동의 없이 개인정보를 외부에 제공하지 않으며, 모임 진행 시 필요한 최소한의 프로필 정보만 상호 간에 공개됩니다.",
  },
  {
    title: "제 5조 (개인정보 관리책임자 및 문의처)",
    body: "서비스 이용 중 발생하는 모든 개인정보 보호 관련 문의, 불만 처리, 피해구제 등에 관한 사항은 아래의 문의처로 연락해 주시기 바랍니다.\n- 서비스명: 종태원\n- 문의 및 개인정보 보호 담당: 종태원 운영팀\n- 문의 이메일: ksz18601@gmail.com",
  },
  {
    title: "제 6조 (계정 삭제 및 데이터 파기 요청)",
    body: "사용자는 언제든지 서비스 내 설정 메뉴 또는 문의 이메일을 통해 계정 삭제(회원 탈퇴)를 요청할 수 있습니다.\n\n- 삭제 요청 방법: 앱 내 ([마이페이지] -> [설정] -> [회원 탈퇴]) 버튼 클릭 혹은 문의 이메일로 요청\n- 즉시 삭제되는 데이터: 계정 프로필 정보, 개인 설정 및 서비스 이용 기록 일체 (탈퇴 즉시 파기)\n- 추가 보관되는 데이터:\n  • 계정 로그인/접속 기록: 3개월 (통신비밀보호법)\n  • 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)\n  • 계약 또는 청약철회, 대금결제 및 재화 공급 기록: 5년 (전자상거래법)\n- 문의 이메일: ksz18601@gmail.com",
  },
  {
    title: "제 7조 (아동 및 청소년 보호 정책)",
    body: "본 서비스는 아동 성적 학대 및 착취(CSAM/CSAE) 콘텐츠를 엄격히 금지합니다. 해당 콘텐츠나 사용자가 발견될 경우 즉시 계정 정지 및 사법 기관 신고가 이루어지며, 서비스 내 신고 기능을 통해 24시간 제보할 수 있습니다.\n- 제보 이메일: ksz18601@gmail.com",
  },
];

export default function TermsModal({
  visible,
  type,
  onClose,
}: TermsModalProps) {
  const title = type === "terms" ? "서비스 이용 약관" : "개인정보 처리 방침";
  const sections = type === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={true}
          >
            {sections.map((section, index) => (
              <View key={index} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "88%",
    maxHeight: "80%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    marginVertical: 4,
    paddingRight: 4,
  },
  sectionContainer: {
    marginBottom: 18,
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#FF3B30", // 기존 웹 화면에 가깝게 포인트를 살려준 예쁜 커스텀 컬러
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    color: "#E5E5EA",
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
