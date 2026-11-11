export const formatDateYear = (dateString: string, lang: string = "en") => {
  if (!dateString) return "";
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

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

    return `${day} ${monthNames[month - 1]}, ${year}`;
  } else {
    return `${year}년 ${month}월 ${day}일`;
  }
};
