// 把留言者名稱隱碼，例如 "yiting" -> "y****g"，只留頭尾各一字，中間全部換成 *
export function maskName(name: string): string {
  const trimmed = name.trim();
  const chars = Array.from(trimmed);
  if (chars.length <= 1) return trimmed;
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}${'*'.repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}
