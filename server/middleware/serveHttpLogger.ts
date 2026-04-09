import type { RequestHandler } from "express";
import { logger } from "../utils/logger/logger";
import { formatHttp } from "../utils/formatHttp";

/**
 * HTTP 日志中间件
 * 记录客户端请求和响应信息
 */
export const serveHttpLogger: () => RequestHandler = () => {
  return (req, res, next) => {
    const startTime = Date.now();

    // 收集响应体
    const chunks: Buffer[] = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    // 重写 write 方法，保持原有签名
    res.write = function (chunk: any, encoding?: any, callback?: any): boolean {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      // 正确处理参数并返回布尔值
      if (typeof encoding === "function") {
        return originalWrite(chunk, encoding);
      }
      return originalWrite(chunk, encoding, callback);
    } as typeof res.write;

    // 重写 end 方法，保持原有签名
    res.end = function (chunk?: any, encoding?: any, callback?: any): typeof res {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      // 正确处理参数并返回 this
      if (typeof chunk === "function") {
        return originalEnd(chunk);
      }
      if (typeof encoding === "function") {
        return originalEnd(chunk, encoding);
      }
      return originalEnd(chunk, encoding, callback);
    } as typeof res.end;

    // 响应完成时记录日志
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const responseBody = Buffer.concat(chunks).toString("utf-8");

      const request = {
        method: req.method,
        url: req.originalUrl || req.url,
        headers: req.headers as Record<string, string>,
        body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      };

      const response = {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage || "",
        headers: res.getHeaders() as Record<string, string>,
        body: responseBody,
      };

      const message = formatHttp({ request, response });

      const logMethod = res.statusCode >= 400 ? logger.error : logger.info;
      logMethod.call(logger, {
        event: "client-http",
        message,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
      });
    });

    next();
  };
};
