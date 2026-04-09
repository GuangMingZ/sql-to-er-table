export function randomId(
  length: number = 16,
  charset: string = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
) {
  if (length < 1) throw new Error("Random ID length must be >= 1");
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}
