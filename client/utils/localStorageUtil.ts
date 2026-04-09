/* eslint-disable local-storage-util/no-direct-localstorage */
/**
 * localStorage 工具类 - 使用单例模式实现
 */

// 预定义的 localStorage 键名
export enum LocalStorageKey {
  LastViewMode = "last_view_mode",
}

// 动态键前缀
export enum LocalStorageKeyPrefix {
 
}

export class LocalStorageUtil {
  // 私有静态实例，保存类的唯一实例
  private static instance: LocalStorageUtil;

  // 存储前缀，避免键名冲突
  private readonly prefix: string;

  // 私有构造函数，防止外部直接实例化
  private constructor(prefix: string = "fullstack_localStorage_") {
    this.prefix = prefix;
  }

  /**
   * 获取单例实例
   * @param prefix 可选的存储前缀
   * @returns LocalStorageUtil 实例
   */
  public static getInstance(prefix?: string): LocalStorageUtil {
    if (!LocalStorageUtil.instance) {
      LocalStorageUtil.instance = new LocalStorageUtil(prefix);
    }
    return LocalStorageUtil.instance;
  }

  /**
   * 生成带前缀的完整键名
   * @param key 键名
   * @returns 带前缀的键名
   */
  private getFullKey(key: LocalStorageKey): string {
    return `${this.prefix}${key}`;
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 值（会被JSON序列化）
   */
  public setItem(key: LocalStorageKey, value: string): void {
    try {
      localStorage.setItem(this.getFullKey(key), value);
    } catch (error) {
      console.error(`Error setting localStorage item '${key}':`, error);
    }
  }

  /**
   * 获取存储项
   * @param key 键名
   * @returns 解析后的值，如果不存在或已过期则返回null
   */
  public getItem(key: LocalStorageKey): string | null {
    try {
      const item = localStorage.getItem(this.getFullKey(key));
      if (!item) return null;
      return item;
    } catch (error) {
      console.error(`Error getting localStorage item '${key}':`, error);
      return null;
    }
  }

  /**
   * 删除存储项
   * @param key 键名
   */
  public remove(key: LocalStorageKey): void {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      console.error(`Error removing localStorage item '${key}':`, error);
    }
  }

  /**
   * 清除所有带前缀的存储项
   */
  public clear(): void {
    try {
      const keysToRemove: string[] = [];

      // 收集所有带前缀的键
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      // 删除收集到的键
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing localStorage items:", error);
    }
  }

  /**
   * 检查键是否存在且未过期
   * @param key 键名
   * @returns 是否存在且未过期
   */
  public has(key: LocalStorageKey): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * 生成动态键的完整键名
   * @param prefix 键前缀
   * @param suffix 动态后缀
   * @returns 完整键名
   */
  private getDynamicKey(prefix: LocalStorageKeyPrefix, suffix: string): string {
    return `${this.prefix}${prefix}${suffix}`;
  }

  /**
   * 设置动态键存储项
   * @param prefix 键前缀
   * @param suffix 动态后缀
   * @param value 值
   */
  public setDynamicItem(
    prefix: LocalStorageKeyPrefix,
    suffix: string,
    value: string
  ): void {
    try {
      localStorage.setItem(this.getDynamicKey(prefix, suffix), value);
    } catch (error) {
      console.error(
        `Error setting localStorage dynamic item '${prefix}${suffix}':`,
        error
      );
    }
  }

  /**
   * 获取动态键存储项
   * @param prefix 键前缀
   * @param suffix 动态后缀
   * @returns 值，如果不存在则返回 null
   */
  public getDynamicItem(
    prefix: LocalStorageKeyPrefix,
    suffix: string
  ): string | null {
    try {
      const item = localStorage.getItem(this.getDynamicKey(prefix, suffix));
      if (!item) return null;
      return item;
    } catch (error) {
      console.error(
        `Error getting localStorage dynamic item '${prefix}${suffix}':`,
        error
      );
      return null;
    }
  }

  /**
   * 删除动态键存储项
   * @param prefix 键前缀
   * @param suffix 动态后缀
   */
  public removeDynamic(prefix: LocalStorageKeyPrefix, suffix: string): void {
    try {
      localStorage.removeItem(this.getDynamicKey(prefix, suffix));
    } catch (error) {
      console.error(
        `Error removing localStorage dynamic item '${prefix}${suffix}':`,
        error
      );
    }
  }

  /**
   * 检查动态键是否存在
   * @param prefix 键前缀
   * @param suffix 动态后缀
   * @returns 是否存在
   */
  public hasDynamic(prefix: LocalStorageKeyPrefix, suffix: string): boolean {
    return this.getDynamicItem(prefix, suffix) !== null;
  }

  /**
   * 获取所有存储项的键名（不带前缀）
   * @returns 键名数组
   */
  public keys(): string[] {
    const keys: string[] = [];

    try {
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key && key.startsWith(this.prefix)) {
          // 移除前缀
          const originalKey = key.substring(this.prefix.length);
          keys.push(originalKey);
        }
      }
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
    }

    return keys;
  }
}

// 导出默认实例
export const localStorageUtil = LocalStorageUtil.getInstance("");
