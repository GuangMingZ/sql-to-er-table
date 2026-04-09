/**
 * 客户端加密工具
 * 与服务端 shared/crypto.ts 保持一致的加密逻辑
 * 使用 Web Crypto API 实现
 */

// 密钥配置（与服务端保持一致）
const ENCRYPTION_KEY = "sql-er-diagram-secret-key-32byte!";

/**
 * 将字符串转换为 ArrayBuffer
 */
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * 将 ArrayBuffer 转换为 Base64 字符串
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 生成 SHA-256 哈希
 */
async function sha256(data: string): Promise<ArrayBuffer> {
  return await crypto.subtle.digest("SHA-256", stringToBuffer(data));
}

/**
 * 获取加密密钥
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyData = await sha256(ENCRYPTION_KEY);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * 加密 SQL 字符串
 * @param sql 原始 SQL 字符串
 * @returns 加密后的 payload
 */
export async function encryptSql(sql: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 推荐 12 字节 IV

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    stringToBuffer(sql)
  );

  // AES-GCM 的加密结果包含 authTag（最后 16 字节）
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  // 组合格式: iv(base64):authTag(base64):encrypted(base64)
  return `${bufferToBase64(iv)}:${bufferToBase64(authTag)}:${bufferToBase64(ciphertext)}`;
}

/**
 * 创建安全的请求数据
 * @param sql 原始 SQL 字符串
 * @returns 加密后的请求参数
 */
export async function createSecureRequest(sql: string): Promise<{
  payload: string;
}> {
  const payload = await encryptSql(sql);
  return { payload };
}
