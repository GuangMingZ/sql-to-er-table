/**
 * 通用的 HTTP 请求工具
 */

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

/**
 * 封装 fetch 请求
 */
export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // 构建查询参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url = `${url}?${searchParams.toString()}`;
  }

  // 默认配置
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    ...fetchOptions,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

/**
 * GET 请求
 */
export function get<T = any>(
  url: string,
  params?: Record<string, string | number>
): Promise<T> {
  return request<T>(url, { method: "GET", params });
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string): Promise<T> {
  return request<T>(url, { method: "DELETE" });
}
