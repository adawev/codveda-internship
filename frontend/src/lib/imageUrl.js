export const normalizeImageUrl = (raw) => {
  if (!raw) {
    return "";
  }

  const value = String(raw).trim();
  if (!value) {
    return "";
  }

  if (value.includes("google.com/imgres") && value.includes("imgurl=")) {
    const query = value.split("?")[1] || "";
    const params = new URLSearchParams(query);
    const directUrl = params.get("imgurl");
    if (directUrl) {
      return directUrl;
    }
  }

  return value;
};
