/**
 * XSS防护工具函数
 * 用于清理HTML内容，防止XSS攻击
 */

/**
 * 简单的XSS防护函数 - 移除危险的脚本标签和事件处理器
 * @param html 需要清理的HTML字符串
 * @returns 清理后的安全HTML字符串
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // 移除script标签及其内容
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除常见的事件处理器属性
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
  
  // 移除javascript: 协议
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // 移除data: 协议中的危险内容
  sanitized = sanitized.replace(/data:\s*text\/html/gi, 'data:text/plain');
  
  // 移除style标签中的expression
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  
  // 移除vbscript: 协议
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  return sanitized;
};

/**
 * 检查HTML内容是否包含潜在的XSS攻击代码
 * @param html HTML字符串
 * @returns 如果包含危险内容返回true，否则返回false
 */
export const containsXSS = (html: string): boolean => {
  if (!html || typeof html !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script\b/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /expression\s*\(/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(html));
};