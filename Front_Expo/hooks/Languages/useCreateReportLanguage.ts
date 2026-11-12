import { getLocales } from "expo-localization";

const translations = {
  ko: {
    alerts: {
      success: "완료",
      error: "오류",
      createReportSuccess: "신고가 성공적으로 접수되었습니다.",
      createReportFail: "신고 접수 중 오류가 발생했습니다.",
    },
  },
  en: {
    alerts: {
      success: "Success",
      error: "Error",
      createReportSuccess: "Report submitted successfully.",
      createReportFail: "Failed to submit report.",
    },
  },
};

export const useCreateReportLanguage = () => {
  const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";
  const currentLang = deviceLanguage === "ko" ? "ko" : "en";
  const t = translations[currentLang];

  return { t, currentLang };
};
