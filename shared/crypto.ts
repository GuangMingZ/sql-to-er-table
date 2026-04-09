import crypto from "crypto";

/**
 * SQL 传输加密工具
 * 使用 AES-256-GCM 加密
 */

// 密钥配置（生产环境应从环境变量读取）
const ENCRYPTION_KEY = process.env.SQL_ENCRYPTION_KEY || "sql-er-diagram-secret-key-32byte!";

// 确保密钥长度为 32 字节（AES-256）
function getKey(key: string): Buffer {
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * 加密 SQL 字符串
 * @param sql 原始 SQL 字符串
 * @returns 加密后的 payload
 */
export function encryptSql(sql: string): string {
  const key = getKey(ENCRYPTION_KEY);
  const iv = crypto.randomBytes(12); // GCM 推荐 12 字节 IV

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(sql, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  // 组合格式: iv(base64):authTag(base64):encrypted(base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * 解密 payload 得到原始 SQL
 * @param payload 加密后的 payload
 * @returns 原始 SQL 字符串
 */
export function decryptSql(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid payload format");
  }

  const [ivBase64, authTagBase64, encrypted] = parts;
  const key = getKey(ENCRYPTION_KEY);
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * 服务端使用：解析加密请求
 */
export function parseSecureRequest(payload: string): { sql: string | null; error?: string } {
  try {
    const sql = decryptSql(payload);
    return { sql };
  } catch (err: any) {
    return { sql: null, error: `Decryption failed: ${err?.message}` };
  }
}
