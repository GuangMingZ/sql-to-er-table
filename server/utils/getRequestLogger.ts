import { logger } from "./logger/logger";
import { formatHttp } from "./formatHttp";

/**
 * 创建请求日志记录器
 */
export function getRequestLogger(service: string, action: string, request: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}) {
  const formatResponse = (response: Response, body: string) => formatHttp({
    request,
    response: {
      statusCode: response.status,
      statusMessage: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    }
  });

  return {
    /** 记录成功响应 */
    success(response: Response, body: string) {
      const logMethod = response.status >= 400 ? logger.error : logger.info;
      logMethod.call(logger, {
        event: 'service-http',
        message: formatResponse(response, body),
        service,
        action,
        statusCode: response.status,
      });
    },

    /** 记录网络连接错误 */
    networkError(error: Error) {
      logger.error({
        event: 'service-http',
        message: formatHttp({ request }) + `\n\n[Network Error] ${error.message}`,
        service,
        action,
        error: error.message,
      });
    },

    /** 记录 JSON 解析错误 */
    parseError(response: Response, body: string, error: Error) {
      logger.error({
        event: 'service-http',
        message: formatResponse(response, body) + `\n\n[Parse Error] ${error.message}`,
        service,
        action,
        statusCode: response.status,
        error: error.message,
      });
    },
  };
}
