export const formatTime = (dateStr: string, lang: string = "en") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);

  const rawHours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  if (lang === "en") {
    const ampm = rawHours >= 12 ? "PM" : "AM";
    const hours = rawHours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  } else {
    const ampm = rawHours >= 12 ? "오후" : "오전";
    const hours = rawHours % 12 || 12;
    return `${ampm} ${hours}:${minutes}`;
  }
};
