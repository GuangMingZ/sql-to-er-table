interface IStateObj {
  [k: string]: string | undefined;
}
/**
 * 设置 URL 上的 search 参数
 * @param stateObj 需要调整的参数对象，key-value
 * @param replace 是否完全替换
 */
export function setSearchParams(stateObj: IStateObj, replace?: boolean) {
  const currentUrl = new URL(window.location.href);

  if (replace) {
    // 直接替换
    const values = Object.keys(stateObj)
      .filter((key) => stateObj[key])
      .map((key) => `${key}=${stateObj[key]}`);
    currentUrl.search = values.length === 0 ? "" : `?${values.join("&")}`;
  } else {
    // 有的修改，没有的增加
    Object.keys(stateObj).forEach((key) => {
      if (stateObj[key]) {
        currentUrl.searchParams.set(key, stateObj[key]!);
      } else {
        currentUrl.searchParams.delete(key);
      }
    });
  }

  window.history.replaceState(null, "", currentUrl.toString());
}

/**
 *  获取 URL 上的 search 参数
 * @param key 参数名
 */
export function getSearchParams(key: string) {
  return new URLSearchParams(window.location.search).get(key) || undefined;
}

/**
 * 获取 URL 上的 search 参数对象
 */
export function getSearchParamsObj() {
  const searchParams = new URLSearchParams(window.location.search);
  const obj: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}
