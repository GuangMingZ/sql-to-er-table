import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// 启用UTC插件
dayjs.extend(utc);

/**
 * 格式化UTC时间字符串为本地时间字符串
 * @param utcDateString - 符合ISO 8601格式的UTC时间字符串（例如："2026-01-17T16:26:16Z"）
 * @returns 格式化后的本地时间字符串（例如："2026-01-18 00:26:16"）
 */
export function formatUtcDate(utcDateString: string) {
  return dayjs(utcDateString).utc().format("YYYY-MM-DD HH:mm:ss");
}
