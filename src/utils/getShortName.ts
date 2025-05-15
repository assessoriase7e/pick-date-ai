export function getShortName(fullName?: string | null) {
  if (!fullName) return null;
  const words = fullName.trim().split(/\s+/);
  return words.slice(0, 2).join(" ");
}
