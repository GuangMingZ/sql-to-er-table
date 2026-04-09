/**
 * HTTP 日志格式化工具
 */

interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface HttpResponse {
  statusCode: number;
  statusMessage: string;
  headers: Record<string, string>;
  body: string;
}

interface FormatHttpOptions {
  request: HttpRequest;
  response?: HttpResponse;
}

/**
 * 格式化 HTTP 请求和响应为可读的日志字符串
 */
export function formatHttp(options: FormatHttpOptions): string {
  const { request, response } = options;
  const lines: string[] = [];

  // 格式化请求
  lines.push(`[Request]`);
  lines.push(`${request.method} ${request.url}`);
  
  // 请求头
  if (Object.keys(request.headers).length > 0) {
    lines.push(`Headers:`);
    Object.entries(request.headers).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value}`);
    });
  }

  // 请求体
  if (request.body) {
    lines.push(`Body:`);
    lines.push(`  ${request.body}`);
  }

  // 格式化响应
  if (response) {
    lines.push(``);
    lines.push(`[Response]`);
    lines.push(`${response.statusCode} ${response.statusMessage}`);

    // 响应头
    if (Object.keys(response.headers).length > 0) {
      lines.push(`Headers:`);
      Object.entries(response.headers).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`);
      });
    }

    // 响应体
    if (response.body) {
      lines.push(`Body:`);
      lines.push(`  ${response.body}`);
    }
  }

  return lines.join('\n');
}
