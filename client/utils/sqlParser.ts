import type { ParseSqlResponse, TableData, RelationshipData, DatabaseType } from "@shared/types";
import { createSecureRequest } from "./crypto";

/**
 * 调用服务端 API 解析 SQL DDL
 * SQL 通过 AES-256-GCM 加密传输，确保安全性
 * 
 * @param sql 原始 SQL DDL 字符串
 * @param database 数据库类型，默认为 MySQL
 * @returns 解析结果
 */
export async function parseSqlToERData(sql: string, database: DatabaseType = "MySQL"): Promise<{
  tables: TableData[];
  relationships: RelationshipData;
  errors: string[];
}> {
  try {
    // 创建加密请求
    const secureRequest = await createSecureRequest(sql);

    // 调用服务端 API
    const response = await fetch("/api/parse-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...secureRequest, database }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        tables: [],
        relationships: { relationships: [] },
        errors: errorData.errors || [`HTTP ${response.status}: ${response.statusText}`],
      };
    }

    const result: ParseSqlResponse = await response.json();

    return {
      tables: result.data?.tables ?? [],
      relationships: result.data?.relationships ?? { relationships: [] },
      errors: result.errors,
    };
  } catch (err: any) {
    return {
      tables: [],
      relationships: { relationships: [] },
      errors: [`请求失败：${err?.message ?? "网络错误"}`],
    };
  }
}
