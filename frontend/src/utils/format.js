// SOFTWARE_AND_IT -> "Software And It"
export function formatCategory(category) {
  if (!category) return "";
  return category
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
