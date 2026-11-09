export const generateRandomNickname = (
  nicknames: any,
  currentLang: string,
): string => {
  const randomAdj =
    nicknames.adjectives[
      Math.floor(Math.random() * nicknames.adjectives.length)
    ];
  const randomNoun =
    nicknames.nouns[Math.floor(Math.random() * nicknames.nouns.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return currentLang === "ko"
    ? `${randomAdj}${randomNoun}${randomNumber}`
    : `${randomAdj}_${randomNoun}_${randomNumber}`;
};
