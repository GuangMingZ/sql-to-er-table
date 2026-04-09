import express, { Router } from "express";
import { parseSqlToERData } from "../services/sqlParser";
import { parseSecureRequest } from "../../shared/crypto";
import type { ParseSqlRequest, ParseSqlResponse } from "../../shared/types";
import { logger } from "../utils/logger";

/**
 * API 路由
 */
export function serveApi() {
  const router = Router();
  router.use(express.json({ limit: "1mb" }));

  // 示例 GET 接口
  router.get("/hello", (_req, res) => {
    res.json({
      message: "Hello from Express API!",
      timestamp: new Date().toISOString(),
    });
  });

  // 示例 POST 接口
  router.post("/echo", (req, res) => {
    const { data } = req.body;
    res.json({
      echo: data,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * SQL 解析接口
   * 接收加密的 SQL DDL，返回解析后的表结构和关系数据
   */
  router.post("/parse-sql", (req, res) => {
    const { payload, database = "MySQL" } = req.body as ParseSqlRequest;

    // 参数校验
    if (!payload) {
      const response: ParseSqlResponse = {
        success: false,
        errors: ["Missing required parameter: payload"],
      };
      return res.status(400).json(response);
    }

    // 解密请求
    const { sql, error } = parseSecureRequest(payload);
    if (!sql) {
      logger.warn({
        event: "parse-sql-security-error",
        message: error || "Decryption failed",
        data: { ip: req.ip },
      });
      const response: ParseSqlResponse = {
        success: false,
        errors: [error || "Decryption failed"],
      };
      return res.status(403).json(response);
    }

    // 解析 SQL
    try {
      const { tables, relationships, errors } = parseSqlToERData(sql, database);

      if (tables.length === 0 && errors.length === 0) {
        errors.push("未检测到 CREATE TABLE 语句，请检查 SQL 格式。");
      }

      const response: ParseSqlResponse = {
        success: tables.length > 0,
        data: tables.length > 0 ? { tables, relationships } : undefined,
        errors,
      };

      logger.info({
        event: "parse-sql-success",
        message: `Parsed ${tables.length} tables with ${relationships.relationships.length} relationships`,
        data: {
          tableCount: tables.length,
          relationshipCount: relationships.relationships.length,
        },
      });

      return res.json(response);
    } catch (err: any) {
      logger.error({
        event: "parse-sql-error",
        message: err?.message ?? "Unknown error",
        stack: err?.stack,
      });
      const response: ParseSqlResponse = {
        success: false,
        errors: [`服务端解析错误：${err?.message ?? "Unknown error"}`],
      };
      return res.status(500).json(response);
    }
  });

  return router;
}
