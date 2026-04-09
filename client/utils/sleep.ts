/**
 * 延迟执行指定毫秒数
 * @param ms - 延迟的毫秒数
 * @returns Promise<void> - 在指定毫秒数后resolve的Promise
 * @example
 * // 使用示例
 * async function example() {
 *   console.log('开始');
 *   await sleep(1000); // 延迟1秒
 *   console.log('1秒后');
 * }
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
