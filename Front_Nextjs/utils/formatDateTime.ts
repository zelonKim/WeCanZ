export const formatDateTime = (dateStr: string, lang: string = "en") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  if (lang === "en") {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[d.getMonth()];
    const day = d.getDate();
    return `${month} ${day}, ${hours}:${minutes}`;
  } else {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}월 ${day}일 / ${hours}:${minutes}`;
  }
};
