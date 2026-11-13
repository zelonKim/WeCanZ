interface NicknameSet {
  adjectives: string[];
  nouns: string[];
}

interface NicknamesDict {
  ko: NicknameSet;
  en: NicknameSet;
}

export const generateRandomNickname = (
  nicknames: NicknamesDict | undefined,
  currentLang: "ko" | "en",
): string => {
  const targetLangSet = nicknames?.[currentLang] || nicknames?.en;

  if (!targetLangSet?.adjectives?.length || !targetLangSet?.nouns?.length) {
    return "";
  }

  const randomAdj =
    targetLangSet.adjectives[
      Math.floor(Math.random() * targetLangSet.adjectives.length)
    ];
  const randomNoun =
    targetLangSet.nouns[Math.floor(Math.random() * targetLangSet.nouns.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return currentLang === "ko"
    ? `${randomAdj}${randomNoun}${randomNumber}`
    : `${randomAdj}_${randomNoun}_${randomNumber}`;
};
